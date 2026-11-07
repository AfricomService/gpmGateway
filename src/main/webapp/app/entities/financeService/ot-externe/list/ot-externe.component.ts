import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
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

import { IOtExterne } from '../ot-externe.model';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, OtExterneService } from '../service/ot-externe.service';
import { OtExterneDeleteDialogComponent } from '../delete/ot-externe-delete-dialog.component';

interface StatutFilterOption {
  label: string;
  value: string | null; // null = "Tous"
  icon: IconProp;
}

interface OtExterneNavChildItem {
  label: string;
  route: string;
}

interface OtExterneNavItem {
  label: string;
  route?: string;
  icon: IconProp;
  children?: OtExterneNavChildItem[];
}

interface StatutFilterOption {
  label: string;
  value: string | null;
  icon: IconProp;
}

@Component({
  selector: 'jhi-ot-externe',
  templateUrl: './ot-externe.component.html',
  styleUrls: ['./ot-externe.component.scss'],
})
export class OtExterneComponent implements OnInit, OnDestroy {
  otExternes?: IOtExterne[];
  filteredOtExternes: IOtExterne[] = [];
  isLoading = false;

  searchTerm = '';

  // clientId -> raisonSociale
  clientsMap = new Map<number, string>();

  // affaireId -> designationAffaire
  affairesMap = new Map<number, string>();

  // ---- Filtre latéral par statut ----
  isSidebarCollapsed = false;
  activeStatutFilter: string | null = null;

  statutFilterOptions: StatutFilterOption[] = [
    { label: 'Tous', value: null, icon: 'clipboard' },
    { label: 'Brouillon', value: 'Brouillon', icon: 'folder' },
    { label: 'Exécution des travaux', value: 'ExecutionDesTravaux', icon: 'clock' },
    { label: 'Terminé', value: 'Fin', icon: 'check-circle' },
  ];

  // statut -> nombre d'OT (calculé côté serveur sur toute la base accessible)
  statutCounts: Record<string, number> = {};

  // Recherche serveur : ids d'affaires correspondants (debounce 400 ms)
  private searchAffaireIds: number[] = [];
  private readonly search$ = new Subject<string>();
  private searchSubscription?: Subscription;

  navItems: OtExterneNavItem[] = [
    {
      label: 'Paramètre OT',
      icon: ['fas', 'cog'],
      children: [
        { label: 'Phase OT', route: 'phase-ot' },
        { label: 'Modele OT', route: 'model-phase-ot' },
      ],
    },
  ];

  expandedGroup: string | null = null;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  constructor(
    protected otExterneService: OtExterneService,
    protected clientService: ClientService,
    protected affaireService: AffaireService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IOtExterne): number => this.otExterneService.getOtExterneIdentifier(item);

  ngOnInit(): void {
    this.load();

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

  toggleGroup(item: OtExterneNavItem): void {
    // En mode réduit, on ouvre automatiquement la sidebar
    // afin de pouvoir afficher le sous-menu.
    if (this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
    }

    this.expandedGroup = this.expandedGroup === item.label ? null : item.label;
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

  // ---- Résolution des noms de clients et d'affaires (à la demande) ----
  protected loadReferencedLabels(otExternes: IOtExterne[]): void {
    const clientIds = this.collectMissingIds(
      otExternes.map(ot => ot.clientId),
      this.clientsMap
    );
    const affaireIds = this.collectMissingIds(
      otExternes.map(ot => ot.affaireId),
      this.affairesMap
    );

    if (clientIds.length > 0) {
      forkJoin(
        clientIds.map(id =>
          this.clientService.find(id).pipe(
            map(res => res.body),
            catchError(() => of(null))
          )
        )
      ).subscribe(clients => {
        clients.forEach(client => {
          if (client?.id !== null && client?.id !== undefined) {
            this.clientsMap.set(client.id, client.raisonSociale ?? '—');
          }
        });
        this.applyFilter();
      });
    }

    if (affaireIds.length > 0) {
      this.affaireService
        .findLabelsByIds(affaireIds)
        .pipe(catchError(() => of({} as Record<string, string>)))
        .subscribe(labels => {
          Object.entries(labels).forEach(([id, label]) => this.affairesMap.set(Number(id), label ?? '—'));
          this.applyFilter();
        });
    }
  }

  protected collectMissingIds(ids: Array<number | null | undefined>, cache: Map<number, string>): number[] {
    const uniqueIds = new Set<number>();
    ids.forEach(id => {
      if (id !== null && id !== undefined && !cache.has(id)) {
        uniqueIds.add(id);
      }
    });
    return Array.from(uniqueIds);
  }

  getClientName(clientId?: number | null): string {
    if (clientId === null || clientId === undefined) {
      return '—';
    }
    return this.clientsMap.get(clientId) ?? String(clientId);
  }

  getAffaireName(affaireId?: number | null): string {
    if (affaireId === null || affaireId === undefined) {
      return '—';
    }
    return this.affairesMap.get(affaireId) ?? String(affaireId);
  }

  // ---- Sidebar : filtre par statut ----
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  selectStatutFilter(value: string | null): void {
    this.activeStatutFilter = value;
    this.page = 1;
    this.reload();
  }

  countByStatut(value: string | null): number {
    if (value === null) {
      return this.totalCount;
    }
    return this.statutCounts[value] ?? 0;
  }

  // ---- Recherche + filtre statut combinés (sur la page courante) ----
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.search$.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.search$.next('');
  }

  // Le filtrage (recherche + statut) est fait côté serveur
  protected applyFilter(): void {
    this.filteredOtExternes = this.otExternes ?? [];
  }

  /** Recharge avec l'état courant (statut, recherche, tri, page) sans passer par la route. */
  protected reload(): void {
    this.queryBackend(this.page, this.predicate, this.ascending).subscribe({
      next: (res: EntityArrayResponseType) => this.onResponseSuccess(res),
    });
  }

  protected loadCounts(): void {
    this.otExterneService
      .countByStatut()
      .pipe(catchError(() => of({} as Record<string, number>)))
      .subscribe(counts => (this.statutCounts = counts));
  }

  // ---- Statistiques des cartes (valeurs réelles de StatutOtExterne) ----
  get totalCount(): number {
    return Object.values(this.statutCounts).reduce((sum, n) => sum + n, 0);
  }

  get creationCount(): number {
    return this.statutCounts['Brouillon'] ?? 0;
  }

  get enCoursCount(): number {
    return this.statutCounts['ExecutionDesTravaux'] ?? 0;
  }

  get finCount(): number {
    return this.statutCounts['Fin'] ?? 0;
  }

  getStatutClass(statut?: string | null): string {
    switch (statut) {
      case 'Brouillon':
        return 'badge-creation';
      case 'ExecutionDesTravaux':
        return 'badge-en-cours';
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
    this.loadReferencedLabels(dataFromBody);
    this.loadCounts();
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
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      sort: this.getSortQueryParam(predicate, ascending),
    };

    if (this.activeStatutFilter) {
      queryObject.statut = this.activeStatutFilter;
    }

    const term = this.searchTerm.trim();
    if (term) {
      queryObject.search = term;
      queryObject.affaireIds = this.searchAffaireIds.join(',');
    }

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
