import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IOtExterne } from '../ot-externe.model';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, OtExterneService } from '../service/ot-externe.service';
import { OtExterneDeleteDialogComponent } from '../delete/ot-externe-delete-dialog.component';

interface StatutFilterOption {
  label: string;
  value: string | null; // null = "Tous"
  icon: IconProp;
}

@Component({
  selector: 'jhi-ot-externe',
  templateUrl: './ot-externe.component.html',
  styleUrls: ['./ot-externe.component.scss'],
})
export class OtExterneComponent implements OnInit {
  otExternes?: IOtExterne[];
  filteredOtExternes: IOtExterne[] = [];
  isLoading = false;

  searchTerm = '';

  // clientId -> raisonSociale
  clientsMap = new Map<number, string>();

  // ---- Filtre latéral par statut ----
  isSidebarCollapsed = false;
  activeStatutFilter: string | null = null;

  statutFilterOptions: StatutFilterOption[] = [
    { label: 'Tous', value: null, icon: 'clipboard' },
    { label: 'Création', value: 'Creation', icon: 'folder' },
    { label: 'En cours', value: 'EnCours', icon: 'clock' },
    { label: 'Paiement', value: 'Paiement', icon: 'file-invoice-dollar' },
    { label: 'Fin', value: 'Fin', icon: 'check-circle' },
  ];

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected otExterneService: OtExterneService,
    protected clientService: ClientService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IOtExterne): number => this.otExterneService.getOtExterneIdentifier(item);

  ngOnInit(): void {
    this.loadClients();
    this.load();
  }

  delete(otExterne: IOtExterne): void {
    const modalRef = this.modalService.open(OtExterneDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.otExterne = otExterne;
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

  // ---- Résolution des noms de clients ----
  protected loadClients(): void {
    // size élevé pour récupérer l'ensemble des clients en une fois ;
    // adaptez si vous avez un très grand nombre de clients (pagination ou endpoint dédié).
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

  // ---- Sidebar : filtre par statut ----
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  selectStatutFilter(value: string | null): void {
    this.activeStatutFilter = value;
    this.applyFilter();
  }

  countByStatut(value: string | null): number {
    if (!this.otExternes) {
      return 0;
    }
    if (value === null) {
      return this.otExternes.length;
    }
    return this.otExternes.filter(ot => ot.statut === value).length;
  }

  // ---- Recherche + filtre statut combinés (sur la page courante) ----
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  protected applyFilter(): void {
    if (!this.otExternes) {
      this.filteredOtExternes = [];
      return;
    }

    let result = this.otExternes;

    if (this.activeStatutFilter !== null) {
      result = result.filter(ot => ot.statut === this.activeStatutFilter);
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        ot =>
          (ot.reference ?? '').toLowerCase().includes(term) ||
          (ot.statut ?? '').toLowerCase().includes(term) ||
          this.getClientName(ot.clientId).toLowerCase().includes(term) ||
          String(ot.affaireId ?? '').includes(term)
      );
    }

    this.filteredOtExternes = result;
  }

  // ---- Statistiques des cartes (valeurs réelles de StatutOtExterne) ----
  get totalCount(): number {
    return this.otExternes?.length ?? 0;
  }

  get creationCount(): number {
    return this.otExternes?.filter(ot => ot.statut === 'Creation').length ?? 0;
  }

  get enCoursCount(): number {
    return this.otExternes?.filter(ot => ot.statut === 'EnCours').length ?? 0;
  }

  get paiementCount(): number {
    return this.otExternes?.filter(ot => ot.statut === 'Paiement').length ?? 0;
  }

  get finCount(): number {
    return this.otExternes?.filter(ot => ot.statut === 'Fin').length ?? 0;
  }

  getStatutClass(statut?: string | null): string {
    switch (statut) {
      case 'Creation':
        return 'badge-creation';
      case 'EnCours':
        return 'badge-en-cours';
      case 'Paiement':
        return 'badge-paiement';
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
    this.otExternes = dataFromBody;
    this.applyFilter();
  }

  protected fillComponentAttributesFromResponseBody(data: IOtExterne[] | null): IOtExterne[] {
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
    return this.otExterneService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
