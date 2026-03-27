import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IAffaire } from '../affaire.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, AffaireService } from '../service/affaire.service';
import { AffaireDeleteDialogComponent } from '../delete/affaire-delete-dialog.component';

/** Maps each StatutAffaire enum value to a CSS class defined in the SCSS. */
const STATUT_CLASS_MAP: Record<string, string> = {
  BROUILLON: 'Brouillon',
  ETUDE_OPPORTUNITE: 'statut-etude',
  EXECUTION_DES_TRAVAUX: 'statut-execution',
  CLOTURE_PROJET: 'statut-cloture',
  FIN: 'statut-fin',
};

@Component({
  selector: 'jhi-affaire',
  templateUrl: './affaire.component.html',
  styleUrls: ['./affaire-list.component.scss'],
})
export class AffaireComponent implements OnInit {
  // ── Raw data from backend ─────────────────────────────────────────────────
  affaires?: IAffaire[];

  // ── Filtered / displayed data ─────────────────────────────────────────────
  filteredAffaires?: IAffaire[];

  // ── Pagination & sort ─────────────────────────────────────────────────────
  isLoading = false;
  predicate = 'id';
  ascending = true;
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // ── UI state ──────────────────────────────────────────────────────────────
  /** Active status filter; null = show all */
  selectedStatut: string | null = null;

  /** Live search term */
  searchTerm = '';

  /** Card grid or table list */
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    protected affaireService: AffaireService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IAffaire): number => this.affaireService.getAffaireIdentifier(item);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.load();
  }

  // ── Public actions ────────────────────────────────────────────────────────

  load(): void {
    this.loadFromBackendWithRouteInformations().subscribe({
      next: (res: EntityArrayResponseType) => this.onResponseSuccess(res),
    });
  }

  delete(affaire: IAffaire): void {
    const modalRef = this.modalService.open(AffaireDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.affaire = affaire;
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        switchMap(() => this.loadFromBackendWithRouteInformations())
      )
      .subscribe({
        next: (res: EntityArrayResponseType) => this.onResponseSuccess(res),
      });
  }

  navigateToWithComponentValues(): void {
    this.handleNavigation(this.page, this.predicate, this.ascending);
  }

  navigateToPage(page = this.page): void {
    this.handleNavigation(page, this.predicate, this.ascending);
  }

  // ── Filter helpers (called from template) ─────────────────────────────────

  /** Called by the status-filter buttons. */
  filterByStatut(statut: string | null): void {
    this.selectedStatut = statut;
    this.applyFilters();
  }

  /** Called on every keystroke in the search input via (ngModelChange). */
  filterAffaires(): void {
    this.applyFilters();
  }

  /** Returns the CSS badge class for a given statut value. */
  getStatutClass(statut: string | undefined): string {
    return statut ? STATUT_CLASS_MAP[statut] ?? '' : '';
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /** Applies both the status filter and the search term to this.affaires. */
  private applyFilters(): void {
    let result = this.affaires ?? [];

    if (this.selectedStatut) {
      result = result.filter(a => a.statut === this.selectedStatut);
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        a =>
          (a.numAffaire ?? '').toString().toLowerCase().includes(term) ||
          (a.designationAffaire ?? '').toLowerCase().includes(term) ||
          (a.client?.raisonSociale ?? '').toLowerCase().includes(term)
      );
    }

    this.filteredAffaires = result;
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
    this.affaires = this.fillComponentAttributesFromResponseBody(response.body);
    // Re-apply any active filters whenever new data arrives from backend.
    this.applyFilters();
  }

  protected fillComponentAttributesFromResponseBody(data: IAffaire[] | null): IAffaire[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  protected queryBackend(page?: number, predicate?: string, ascending?: boolean): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const pageToLoad = page ?? 1;
    const queryObject = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      eagerload: true,
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.affaireService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(page = this.page, predicate?: string, ascending?: boolean): void {
    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page,
        size: this.itemsPerPage,
        sort: this.getSortQueryParam(predicate, ascending),
      },
    });
  }

  protected getSortQueryParam(predicate = this.predicate, ascending = this.ascending): string[] {
    if (predicate === '') {
      return [];
    }
    return [`${predicate},${ascending ? ASC : DESC}`];
  }
}
