import { Component, OnInit } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { combineLatest, filter, forkJoin, Observable, switchMap, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { INoteFrais } from '../note-frais.model';

import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { ASC, DESC, SORT, ITEM_DELETED_EVENT, DEFAULT_SORT_DATA } from 'app/config/navigation.constants';
import { EntityArrayResponseType, NoteFraisService } from '../service/note-frais.service';
import { NoteFraisDeleteDialogComponent } from '../delete/note-frais-delete-dialog.component';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';

@Component({
  selector: 'jhi-note-frais',
  templateUrl: './note-frais.component.html',
  styleUrls: ['./note-frais.component.scss'],
})
export class NoteFraisComponent implements OnInit {
  noteFrais?: INoteFrais[];
  isLoading = false;

  predicate = 'id';
  ascending = true;

  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;

  // Nom du bénéficiaire, par contactSocieteId (chargé à la demande)
  private beneficiaires = new Map<number, string>();

  constructor(
    protected noteFraisService: NoteFraisService,
    protected bonCommandeService: BonCommandeService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected modalService: NgbModal
  ) {}

  trackId = (_index: number, item: INoteFrais): number => this.noteFraisService.getNoteFraisIdentifier(item);

  ngOnInit(): void {
    this.load();
  }

  beneficiaireName(contactSocieteId?: number | null): string {
    if (contactSocieteId === null || contactSocieteId === undefined) {
      return '—';
    }
    return this.beneficiaires.get(contactSocieteId) ?? 'Chargement...';
  }

  openView(noteFrais: INoteFrais): void {
    this.router.navigate(['/note-frais', noteFrais.id, 'view']);
  }

  delete(noteFrais: INoteFrais): void {
    const modalRef = this.modalService.open(NoteFraisDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.noteFrais = noteFrais;
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
    this.noteFrais = dataFromBody;
    this.loadBeneficiaires(dataFromBody);
  }

  /** Charge uniquement les bénéficiaires de la page courante qui ne sont pas déjà en cache. */
  private loadBeneficiaires(list: INoteFrais[]): void {
    const ids = Array.from(new Set(list.map(n => n.contactSocieteId).filter((id): id is number => id !== null && id !== undefined))).filter(
      id => !this.beneficiaires.has(id)
    );

    if (ids.length === 0) {
      return;
    }

    forkJoin(ids.map(id => this.bonCommandeService.findResponsableById(id))).subscribe({
      next: responses =>
        responses.forEach((r, i) => {
          this.beneficiaires.set(ids[i], r.body?.nomPrenom ?? '—');
        }),
    });
  }

  protected fillComponentAttributesFromResponseBody(data: INoteFrais[] | null): INoteFrais[] {
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
    return this.noteFraisService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
