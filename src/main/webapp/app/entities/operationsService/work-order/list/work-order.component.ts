import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IWorkOrder } from '../work-order.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, WorkOrderService } from '../service/work-order.service';
import { WorkOrderDeleteDialogComponent } from '../delete/work-order-delete-dialog.component';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

type MissionViewKey = 'ALL' | StatutWO;

interface MissionView {
  key: MissionViewKey;
  label: string;
  icon: IconProp;
  statut?: StatutWO;
}

@Component({
  selector: 'jhi-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss'],
})
export class WorkOrderComponent implements OnInit {
  workOrders?: IWorkOrder[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // --- Barre d'outils : recherche / filtres --------------------------
  // NOTE: aucune API de recherche/filtre n'existe encore côté back-end.
  // Ces champs sont câblés en ngModel uniquement ; les méthodes ci-dessous
  // sont des emplacements (TODO) à brancher plus tard.
  searchTerm = '';
  selectedStatut: StatutWO | null = null;
  selectedClientId: number | null = null;

  clientIds: number[] = []; // TODO: alimenter via un futur ClientService.query() (liste des clients existants)

  viewMode: 'grid' | 'list' = 'grid';

  views: MissionView[] = [
    { key: 'ALL', label: 'Toutes les missions', icon: 'list' },
    { key: StatutWO.Creation, label: 'Création', icon: 'calendar-alt', statut: StatutWO.Creation },
    { key: StatutWO.ExecutionTravaux, label: 'Exécution travaux', icon: 'clock', statut: StatutWO.ExecutionTravaux },
    { key: StatutWO.VerificationWO, label: 'Vérification WO', icon: 'search', statut: StatutWO.VerificationWO },
    { key: StatutWO.ValidationTechnique, label: 'Validation technique', icon: 'check', statut: StatutWO.ValidationTechnique },
    { key: StatutWO.ValidationRessources, label: 'Validation ressources', icon: 'check-double', statut: StatutWO.ValidationRessources },
    { key: StatutWO.Fin, label: 'Terminées', icon: 'check-circle', statut: StatutWO.Fin },
  ];
  activeView: MissionViewKey = 'ALL';

  constructor(
    protected workOrderService: WorkOrderService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IWorkOrder): number => this.workOrderService.getWorkOrderIdentifier(item);

  ngOnInit(): void {
    this.load();
  }

  delete(workOrder: IWorkOrder): void {
    const modalRef = this.modalService.open(WorkOrderDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.workOrder = workOrder;
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

  // --- Barre d'outils ---------------------------------------------------

  selectView(view: MissionView): void {
    this.activeView = view.key;
    this.selectedStatut = view.statut ?? null;
    // TODO: quand l'API de recherche/filtre existera, relancer this.load() avec le filtre statut
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onSearchChange(): void {
    // TODO: brancher sur une API de recherche côté back-end quand elle existera.
  }

  onStatutFilterChange(): void {
    // TODO: brancher sur une API de filtre par statut quand elle existera.
  }

  onClientFilterChange(): void {
    // TODO: brancher sur une API de filtre par client quand elle existera.
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = null;
    this.selectedClientId = null;
    this.activeView = 'ALL';
  }

  // --- Aide à l'affichage -------------------------------------------

  missionTitle(workOrder: IWorkOrder): string {
    return workOrder.remarque || workOrder.numFicheIntervention || `Work Order #${workOrder.id}`;
  }

  statutBadgeClass(statut?: StatutWO | null): string {
    switch (statut) {
      case StatutWO.Fin:
        return 'badge-success';
      case StatutWO.VerificationWO:
        return 'badge-info-soft';
      case StatutWO.ExecutionTravaux:
        return 'badge-warning';
      case StatutWO.ValidationTechnique:
      case StatutWO.ValidationRessources:
        return 'badge-purple';
      default:
        return 'badge-neutral';
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
    this.workOrders = dataFromBody;
  }

  protected fillComponentAttributesFromResponseBody(data: IWorkOrder[] | null): IWorkOrder[] {
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
    return this.workOrderService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
