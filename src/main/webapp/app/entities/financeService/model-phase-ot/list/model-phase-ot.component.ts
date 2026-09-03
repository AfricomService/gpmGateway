import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IModelPhaseOT } from '../model-phase-ot.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, ModelPhaseOTService } from '../service/model-phase-ot.service';
import { ModelPhaseOTDeleteDialogComponent } from '../delete/model-phase-ot-delete-dialog.component';

@Component({
  selector: 'jhi-model-phase-ot',
  templateUrl: './model-phase-ot.component.html',
  styleUrls: ['./model-phase-ot.component.scss'],
})
export class ModelPhaseOTComponent implements OnInit {
  // ── Raw data from backend ─────────────────────────────────────────────────
  modelPhaseOTS?: IModelPhaseOT[];

  // ── Filtered / displayed data ─────────────────────────────────────────────
  filteredModelPhaseOTS?: IModelPhaseOT[];

  // ── Pagination & sort ─────────────────────────────────────────────────────
  isLoading = false;
  predicate = 'id';
  ascending = true;
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // ── UI state ──────────────────────────────────────────────────────────────
  /** Live search term */
  searchTerm = '';

  /** Card grid or table list */
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    protected modelPhaseOTService: ModelPhaseOTService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: IModelPhaseOT): number => this.modelPhaseOTService.getModelPhaseOTIdentifier(item);

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

  /** Called by the "Actualiser" button. */
  refresh(): void {
    this.load();
  }

  delete(modelPhaseOT: IModelPhaseOT): void {
    const modalRef = this.modalService.open(ModelPhaseOTDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.modelPhaseOT = modelPhaseOT;
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        switchMap(() => this.loadFromBackendWithRouteInformations())
      )
      .subscribe({
        next: (res: EntityArrayResponseType) => this.onResponseSuccess(res),
      });
  }

  /** Called on double-click on a card or a row: navigate straight to the edit screen. */
  goToEdit(modelPhaseOT: IModelPhaseOT): void {
    this.router.navigate(['/ot-externe/model-phase-ot', modelPhaseOT.id, 'edit']);
  }

  navigateToWithComponentValues(): void {
    this.handleNavigation(this.page, this.predicate, this.ascending);
  }

  navigateToPage(page = this.page): void {
    this.handleNavigation(page, this.predicate, this.ascending);
  }

  // ── Filter helpers (called from template) ─────────────────────────────────

  /** Called on every keystroke in the search input via (ngModelChange). */
  filterModelPhaseOTS(): void {
    this.applyFilters();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /** Applies the search term to this.modelPhaseOTS. */
  private applyFilters(): void {
    let result = this.modelPhaseOTS ?? [];

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        m =>
          (m.nom ?? '').toLowerCase().includes(term) ||
          (m.description ?? '').toLowerCase().includes(term) ||
          String(m.id ?? '').includes(term)
      );
    }

    this.filteredModelPhaseOTS = result;
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
    this.modelPhaseOTS = this.fillComponentAttributesFromResponseBody(response.body);
    // Re-apply any active filters whenever new data arrives from backend.
    this.applyFilters();
  }

  protected fillComponentAttributesFromResponseBody(data: IModelPhaseOT[] | null): IModelPhaseOT[] {
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
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.modelPhaseOTService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
