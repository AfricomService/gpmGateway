import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  debounceTime,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IWorkOrder } from '../work-order.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, WorkOrderService } from '../service/work-order.service';
import { WorkOrderDeleteDialogComponent } from '../delete/work-order-delete-dialog.component';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IVehicule } from 'app/entities/projectService/vehicule/vehicule.model';
import { VehiculeService } from 'app/entities/projectService/vehicule/service/vehicule.service';

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
export class WorkOrderComponent implements OnInit, OnDestroy {
  workOrders?: IWorkOrder[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // --- Barre d'outils : recherche / filtres --------------------------
  // Recherche : identifiant unique du WO ou affaire (désignation / identifiant / numéro).
  // Les ids d'affaires correspondants sont résolus côté projectservice (debounce 400 ms).
  searchTerm = '';
  private searchAffaireIds: number[] = [];
  private readonly search$ = new Subject<string>();
  private searchSubscription?: Subscription;
  selectedStatut: StatutWO | null = null;
  selectedClientId: number | null = null;

  clients: IClient[] = [];
  filteredClients: IClient[] = [];
  clientSearchTerm = '';
  isClientDropdownOpen = false;
  clientDropdownStyle: { [key: string]: string } = {};

  @ViewChild('clientFilterTrigger') clientFilterTrigger?: ElementRef<HTMLButtonElement>;

  // Caches "à la demande" : uniquement les affaires/véhicules référencés
  // par la page de Work Orders actuellement affichée (évite de précharger
  // toute la base comme pour les clients).
  private affairesCache = new Map<number, IAffaire>();
  private vehiculesCache = new Map<number, IVehicule>();

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
    protected clientService: ClientService,
    protected affaireService: AffaireService,
    protected vehiculeService: VehiculeService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IWorkOrder): number => this.workOrderService.getWorkOrderIdentifier(item);

  ngOnInit(): void {
    this.load();
    this.loadClients();

    this.searchSubscription = this.search$
      .pipe(
        debounceTime(400),
        switchMap(term => {
          const trimmed = term.trim();
          if (!trimmed) {
            return of<number[]>([]);
          }
          return this.affaireService.searchIds(trimmed).pipe(
            map(res => res.body ?? []),
            catchError(() => of<number[]>([]))
          );
        })
      )
      .subscribe(ids => {
        this.searchAffaireIds = ids;
        this.page = 1;
        this.reload();
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.search$.complete();
  }
  protected loadClients(): void {
    this.clientService.query({ size: 1000, sort: ['raisonSociale,asc'] }).subscribe({
      next: res => {
        this.clients = res.body ?? [];
        this.filteredClients = this.clients;
      },
    });
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
    this.page = 1;
    this.reload();
  }

  /**
   * Recharge les Work Orders avec l'état courant du composant (page, tri, filtre de statut),
   * sans dépendre des query params de route — utilisé par les filtres de la barre latérale
   * qui ne doivent pas déclencher de navigation.
   */
  private reload(): void {
    this.queryBackend(this.page, this.predicate, this.ascending).subscribe({
      next: (res: EntityArrayResponseType) => this.onResponseSuccess(res),
    });
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onSearchChange(): void {
    this.search$.next(this.searchTerm);
  }

  // --- Filtre client : dropdown recherchable ----------------------------
  // Le panneau est positionné en `fixed` et calculé au moment de l'ouverture
  // (et recalculé au scroll/resize) car un `position: absolute` classique
  // déborde du viewport quand le bouton se trouve en bas de la fenêtre
  // (ex. sidebar sticky avec beaucoup de contenu au-dessus).

  toggleClientDropdown(): void {
    this.isClientDropdownOpen = !this.isClientDropdownOpen;
    if (this.isClientDropdownOpen) {
      this.clientSearchTerm = '';
      this.filteredClients = this.clients;
      // setTimeout : on attend que le *ngIf ait inséré le bouton trigger
      // (déjà présent) mais surtout pour laisser le layout se stabiliser
      // avant de lire getBoundingClientRect().
      setTimeout(() => this.positionClientDropdown());
    }
  }

  closeClientDropdown(): void {
    this.isClientDropdownOpen = false;
  }

  @HostListener('window:resize')
  @HostListener('window:scroll', ['true'])
  onWindowChangeForClientDropdown(): void {
    if (this.isClientDropdownOpen) {
      this.positionClientDropdown();
    }
  }

  private positionClientDropdown(): void {
    const triggerEl = this.clientFilterTrigger?.nativeElement;
    if (!triggerEl) {
      return;
    }

    const rect = triggerEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const margin = 12;
    const preferredHeight = 320;

    const spaceBelow = viewportHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    if (spaceBelow >= 180 || spaceBelow >= spaceAbove) {
      // Ouverture vers le bas (comportement par défaut)
      this.clientDropdownStyle = {
        position: 'fixed',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        top: `${rect.bottom + 6}px`,
        maxHeight: `${Math.max(120, Math.min(preferredHeight, spaceBelow))}px`,
      };
    } else {
      // Pas assez de place en dessous : on ouvre vers le haut
      this.clientDropdownStyle = {
        position: 'fixed',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        bottom: `${viewportHeight - rect.top + 6}px`,
        maxHeight: `${Math.max(120, Math.min(preferredHeight, spaceAbove))}px`,
      };
    }
  }

  onClientSearchChange(): void {
    const term = this.clientSearchTerm.trim().toLowerCase();
    this.filteredClients = term ? this.clients.filter(c => (c.raisonSociale ?? '').toLowerCase().includes(term)) : this.clients;
  }

  selectClient(client: IClient | null): void {
    this.selectedClientId = client?.id ?? null;
    this.isClientDropdownOpen = false;
    this.page = 1;
    this.reload();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.searchAffaireIds = [];
    this.selectedStatut = null;
    this.selectedClientId = null;
    this.clientSearchTerm = '';
    this.closeClientDropdown();
    this.activeView = 'ALL';
    this.page = 1;
    this.reload();
  }

  // --- Aide à l'affichage -------------------------------------------

  missionTitle(workOrder: IWorkOrder): string {
    return workOrder.remarque || workOrder.numFicheIntervention || workOrder.identifiantUnique || 'Mission sans titre';
  }

  /**
   * Référence lisible affichée en en-tête de carte, à la place de l'id technique.
   */
  missionReference(workOrder: IWorkOrder): string {
    return workOrder.identifiantUnique || workOrder.numFicheIntervention || 'Sans référence';
  }

  clientName(clientId?: number | null): string {
    if (!clientId) {
      return '—';
    }
    const client = this.clients.find(c => c.id === clientId);
    return client?.raisonSociale ?? 'Chargement...';
  }

  affaireName(affaireId?: number | null): string {
    if (!affaireId) {
      return '—';
    }
    const affaire = this.affairesCache.get(affaireId);
    return affaire?.designationAffaire ?? 'Chargement...';
  }

  vehiculeLabel(vehiculeId?: number | null): string {
    if (!vehiculeId) {
      return '—';
    }
    const vehicule = this.vehiculesCache.get(vehiculeId);
    return vehicule ? `${vehicule.marque} ${vehicule.type} (${vehicule.matricule})` : 'Chargement...';
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
    this.loadReferencedLabels(dataFromBody);
  }

  /**
   * Charge uniquement les Affaires / Véhicules référencés par les Work Orders
   * de la page courante et pas déjà en cache, pour pouvoir afficher leur nom
   * au lieu de leur ID technique.
   */
  private loadReferencedLabels(workOrders: IWorkOrder[]): void {
    const affaireIds = this.collectMissingIds(
      workOrders.map(wo => wo.affaireId),
      this.affairesCache
    );
    const vehiculeIds = this.collectMissingIds(
      workOrders.map(wo => wo.vehiculeId),
      this.vehiculesCache
    );

    if (affaireIds.length > 0) {
      forkJoin(affaireIds.map(id => this.affaireService.find(id))).subscribe({
        next: responses => {
          responses.forEach(res => {
            if (res.body?.id !== undefined && res.body?.id !== null) {
              this.affairesCache.set(res.body.id, res.body);
            }
          });
        },
      });
    }

    if (vehiculeIds.length > 0) {
      forkJoin(vehiculeIds.map(id => this.vehiculeService.find(id))).subscribe({
        next: responses => {
          responses.forEach(res => {
            if (res.body?.id !== undefined && res.body?.id !== null) {
              this.vehiculesCache.set(res.body.id, res.body);
            }
          });
        },
      });
    }
  }

  private collectMissingIds(ids: Array<number | null | undefined>, cache: Map<number, unknown>): number[] {
    const uniqueIds = new Set<number>();
    ids.forEach(id => {
      if (id !== null && id !== undefined && !cache.has(id)) {
        uniqueIds.add(id);
      }
    });
    return Array.from(uniqueIds);
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
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      sort: this.getSortQueryParam(predicate, ascending),
    };

    if (this.selectedStatut) {
      queryObject.statut = this.selectedStatut;
    }

    if (this.selectedClientId) {
      queryObject.clientId = this.selectedClientId;
    }

    const term = this.searchTerm.trim();
    if (term) {
      queryObject.search = term;
      // Envoyé en "1,2,3" : Spring convertit cette chaîne en List<Long>.
      // Si aucune affaire ne correspond, la chaîne vide est ignorée par createRequestOption
      // et le backend utilise la valeur sentinelle (seule la recherche par identifiant WO s'applique).
      queryObject.affaireIds = this.searchAffaireIds.join(',');
    }

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
