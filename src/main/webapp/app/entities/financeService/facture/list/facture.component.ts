import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IFacture } from '../facture.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, FactureService } from '../service/facture.service';
import { FactureDeleteDialogComponent } from '../delete/facture-delete-dialog.component';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';

interface StatutOption {
  label: string;
  value: string | null; // null = "Tous les statuts"
}

@Component({
  selector: 'jhi-facture',
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.scss'],
})
export class FactureComponent implements OnInit {
  factures?: IFacture[];
  filteredFactures: IFacture[] = [];
  isLoading = false;

  searchTerm = '';
  statutFilter: string | null = null;
  isGridView = false;

  // clientId -> raisonSociale
  clientsMap = new Map<number, string>();

  statutOptions: StatutOption[] = [
    { label: 'Tous les statuts', value: null },
    { label: 'Création', value: 'Creation' },
    { label: 'Vérification', value: 'Verification' },
    { label: 'Paiement', value: 'Paiement' },
    { label: 'Décharge', value: 'Decharge' },
    { label: 'Fin', value: 'Fin' },
  ];

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected factureService: FactureService,
    protected clientService: ClientService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IFacture): number => this.factureService.getFactureIdentifier(item);

  ngOnInit(): void {
    this.loadClients();
    this.load();
  }

  // ---- Résolution des noms de clients ----
  protected loadClients(): void {
    this.clientService.query({ size: 2000, sort: ['raisonSociale,asc'] }).subscribe({
      next: (res: HttpResponse<IClient[]>) => {
        this.clientsMap = new Map((res.body ?? []).filter(c => c.id != null).map(c => [c.id as number, c.raisonSociale ?? '—']));
      },
    });
  }

  getClientName(clientId?: number | null): string {
    if (clientId === null || clientId === undefined) {
      return '—';
    }
    return this.clientsMap.get(clientId) ?? String(clientId);
  }

  delete(facture: IFacture): void {
    const modalRef = this.modalService.open(FactureDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.facture = facture;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        switchMap(() => this.loadFromBackendWithRouteInformations())
      )
      .subscribe({
        next: (res: EntityArrayResponseType) => {
          this.onResponseSuccess(res);
        },
      });
  }

  load(): void {
    this.loadFromBackendWithRouteInformations().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(): void {
    this.handleNavigation(this.page, this.predicate, this.ascending);
  }

  navigateToPage(page = this.page): void {
    this.handleNavigation(page, this.predicate, this.ascending);
  }

  goToEdit(facture: IFacture): void {
    this.router.navigate(['/facture', facture.id, 'edit']);
  }

  // ---- Vue tableau / grille ----
  setGridView(isGrid: boolean): void {
    this.isGridView = isGrid;
  }

  // ---- Recherche + filtre statut ----
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  onStatutChange(value: string): void {
    this.statutFilter = value === '' ? null : value;
    this.applyFilter();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statutFilter = null;
    this.applyFilter();
  }

  protected applyFilter(): void {
    if (!this.factures) {
      this.filteredFactures = [];
      return;
    }

    let result = this.factures;

    if (this.statutFilter !== null) {
      result = result.filter(f => f.statut === this.statutFilter);
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        f =>
          (f.numFacture ?? '').toLowerCase().includes(term) ||
          (f.bonDeCommande ?? '').toLowerCase().includes(term) ||
          (f.statut ?? '').toLowerCase().includes(term) ||
          this.getClientName(f.clientId).toLowerCase().includes(term)
      );
    }

    this.filteredFactures = result;
  }

  // ---- Statistiques des cartes ----
  get totalCount(): number {
    return this.factures?.length ?? 0;
  }

  // ⚠️ "Devis" et "Notes de Frais" ne sont pas gérés par ce service — reliez-les
  // à leurs propres services quand ces entités seront disponibles.
  get devisCount(): number {
    return 0;
  }

  get caEncaisse(): number {
    return this.factures?.filter(f => f.statut === 'Fin').reduce((sum, f) => sum + (f.montantFacture ?? 0), 0) ?? 0;
  }

  get montantEnAttente(): number {
    return this.factures?.filter(f => f.statut !== 'Fin').reduce((sum, f) => sum + (f.montantFacture ?? 0), 0) ?? 0;
  }

  getStatutClass(statut?: string | null): string {
    switch (statut) {
      case 'Creation':
        return 'badge-creation';
      case 'Verification':
        return 'badge-verification';
      case 'Paiement':
        return 'badge-paiement';
      case 'Decharge':
        return 'badge-decharge';
      case 'Fin':
        return 'badge-fin';
      default:
        return 'badge-default';
    }
  }

  protected loadFromBackendWithRouteInformations(): Observable<EntityArrayResponseType> {
    return combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data]).pipe(
      tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
      switchMap(() => this.queryBackend(this.page, this.predicate, this.ascending))
    );
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
    const sort = (params.get(SORT) ?? data[DEFAULT_SORT_DATA]).split(',');
    this.predicate = sort[0];
    this.ascending = sort[1] === ASC;
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.factures = dataFromBody;
    this.applyFilter();
  }

  protected fillComponentAttributesFromResponseBody(data: IFacture[] | null): IFacture[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  protected queryBackend(page?: number, predicate?: string, ascending?: boolean): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const pageToLoad: number = page ?? 1;
    const queryObject = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.factureService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(page = this.page, predicate?: string, ascending?: boolean): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage,
      sort: this.getSortQueryParam(predicate, ascending),
    };

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }

  protected getSortQueryParam(predicate = this.predicate, ascending = this.ascending): string[] {
    const ascendingQueryParam = ascending ? ASC : DESC;
    if (predicate === '') {
      return [];
    } else {
      return [predicate + ',' + ascendingQueryParam];
    }
  }
}
