import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faSync,
  faPlus,
  faSearch,
  faThLarge,
  faList,
  faEye,
  faPencilAlt,
  faTrashAlt,
  faSort,
  faCalendar,
  faHourglassHalf,
  faHourglassEnd,
  faLock,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons';

import { IPhaseOt } from '../phase-ot.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, PhaseOtService } from '../service/phase-ot.service';
import { PhaseOtDeleteDialogComponent } from '../delete/phase-ot-delete-dialog.component';

@Component({
  selector: 'jhi-phase-ot',
  templateUrl: './phase-ot.component.html',
  styleUrls: ['./phase-ot.component.scss'],
})
export class PhaseOtComponent implements OnInit {
  // ── Raw data from backend ─────────────────────────────────────────────────
  phaseOts?: IPhaseOt[];

  // ── Filtered / displayed data ─────────────────────────────────────────────
  filteredPhaseOts?: IPhaseOt[];

  // ── Pagination & sort ─────────────────────────────────────────────────────
  isLoading = false;
  predicate = 'id';
  ascending = true;
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // ── UI state ──────────────────────────────────────────────────────────────
  searchTerm = '';
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    protected phaseOtService: PhaseOtService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal,
    private iconLibrary: FaIconLibrary
  ) {
    this.iconLibrary.addIcons(
      faSync,
      faPlus,
      faSearch,
      faThLarge,
      faList,
      faEye,
      faPencilAlt,
      faTrashAlt,
      faSort,
      faCalendar,
      faHourglassHalf,
      faHourglassEnd,
      faLock,
      faLockOpen
    );
  }

  trackId = (_index: number, item: IPhaseOt): number => this.phaseOtService.getPhaseOtIdentifier(item);

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

  refresh(): void {
    this.load();
  }

  delete(phaseOt: IPhaseOt): void {
    const modalRef = this.modalService.open(PhaseOtDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.phaseOt = phaseOt;
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        switchMap(() => this.loadFromBackendWithRouteInformations())
      )
      .subscribe({
        next: (res: EntityArrayResponseType) => this.onResponseSuccess(res),
      });
  }

  goToEdit(phaseOt: IPhaseOt): void {
    this.router.navigate(['/ot-externe/phase-ot', phaseOt.id, 'edit']);
  }

  navigateToWithComponentValues(): void {
    this.handleNavigation(this.page, this.predicate, this.ascending);
  }

  navigateToPage(page = this.page): void {
    this.handleNavigation(page, this.predicate, this.ascending);
  }

  // ── Filter helpers (called from template) ─────────────────────────────────

  filterPhaseOts(): void {
    this.applyFilters();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

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
    this.phaseOts = this.fillComponentAttributesFromResponseBody(response.body);
    this.applyFilters();
  }

  protected fillComponentAttributesFromResponseBody(data: IPhaseOt[] | null): IPhaseOt[] {
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
    return this.phaseOtService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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

  private applyFilters(): void {
    let result = this.phaseOts ?? [];

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        p =>
          (p.nom ?? '').toLowerCase().includes(term) ||
          (p.description ?? '').toLowerCase().includes(term) ||
          (p.statut ?? '').toLowerCase().includes(term) ||
          String(p.id ?? '').includes(term) ||
          String(p.phaseParentId ?? '').includes(term)
      );
    }

    this.filteredPhaseOts = result;
  }
}
