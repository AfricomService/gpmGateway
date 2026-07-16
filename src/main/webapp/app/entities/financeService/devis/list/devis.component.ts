import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IDevis } from '../devis.model';
import { StatutDevis } from 'app/entities/enumerations/statut-devis.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, DevisService } from '../service/devis.service';
import { DevisDeleteDialogComponent } from '../delete/devis-delete-dialog.component';

interface StatutOption {
  label: string;
  value: StatutDevis | null; // null = "Tous les statuts"
}

@Component({
  selector: 'jhi-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss'],
})
export class DevisComponent implements OnInit {
  devis?: IDevis[];
  filteredDevis: IDevis[] = [];
  isLoading = false;

  searchTerm = '';
  statutFilter: StatutDevis | null = null;
  isGridView = false;

  statutOptions: StatutOption[] = [
    { label: 'Tous les statuts', value: null },
    { label: 'Création', value: StatutDevis.Creation },
    { label: 'Exécution des travaux', value: StatutDevis.ExecutionDesTravaux },
    { label: 'Terminé', value: StatutDevis.Fin },
  ];

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected devisService: DevisService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IDevis): number => this.devisService.getDevisIdentifier(item);

  ngOnInit(): void {
    this.load();
  }

  delete(devis: IDevis): void {
    const modalRef = this.modalService.open(DevisDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.devis = devis;
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

  goToEdit(devis: IDevis): void {
    this.router.navigate(['/devis', devis.id, 'edit']);
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
    this.statutFilter = value === '' ? null : (value as StatutDevis);
    this.applyFilter();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statutFilter = null;
    this.applyFilter();
  }

  protected applyFilter(): void {
    if (!this.devis) {
      this.filteredDevis = [];
      return;
    }

    let result = this.devis;

    if (this.statutFilter !== null) {
      result = result.filter(d => d.statut === this.statutFilter);
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(d =>
        [d.reference, d.workOrderId?.toString(), d.facture?.numFacture, d.montant?.toString()]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term)
      );
    }

    this.filteredDevis = result;
  }

  // ---- Statistiques des cartes ----
  get totalCount(): number {
    return this.devis?.length ?? 0;
  }

  get montantTotal(): number {
    return this.devis?.reduce((sum, d) => sum + (d.montant ?? 0), 0) ?? 0;
  }

  get montantEncaisse(): number {
    return this.devis?.filter(d => d.statut === StatutDevis.Fin).reduce((sum, d) => sum + (d.montant ?? 0), 0) ?? 0;
  }

  get montantEnAttente(): number {
    return this.devis?.filter(d => d.statut !== StatutDevis.Fin).reduce((sum, d) => sum + (d.montant ?? 0), 0) ?? 0;
  }

  statutLabel(statut: StatutDevis | null | undefined): string {
    return this.statutOptions.find(o => o.value === statut)?.label ?? statut ?? '';
  }

  getStatutClass(statut?: StatutDevis | null): string {
    switch (statut) {
      case StatutDevis.Creation:
        return 'badge-creation';
      case StatutDevis.ExecutionDesTravaux:
        return 'badge-execution';
      case StatutDevis.Fin:
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
    this.devis = dataFromBody;
    this.applyFilter();
  }

  protected fillComponentAttributesFromResponseBody(data: IDevis[] | null): IDevis[] {
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
      eagerload: true,
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.devisService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
