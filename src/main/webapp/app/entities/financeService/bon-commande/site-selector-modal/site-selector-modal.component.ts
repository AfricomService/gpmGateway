import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ISite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';

const PAGE_SIZE = 20;

@Component({
  selector: 'jhi-site-selector-modal',
  templateUrl: './site-selector-modal.component.html',
  styleUrls: ['./site-selector-modal.component.scss'],
})
export class SiteSelectorModalComponent implements OnInit, OnDestroy {
  /**
   * Client final dont on veut afficher les sites, injecté par le composant
   * appelant via `modalRef.componentInstance.clientId = ...`.
   */
  @Input() clientId: number | null = null;

  sites: ISite[] = [];

  search = '';

  loading = false;

  // Pagination serveur (page 0-based, comme Spring Data)
  page = 0;
  readonly pageSize = PAGE_SIZE;
  totalItems = 0;

  private readonly searchSubject = new Subject<string>();
  private readonly loadSubject = new Subject<void>();

  constructor(public activeModal: NgbActiveModal, private siteService: SiteService) {}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get hasPrevious(): boolean {
    return this.page > 0;
  }

  get hasNext(): boolean {
    return this.page + 1 < this.totalPages;
  }

  ngOnInit(): void {
    // Toute nouvelle recherche repart de la première page
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.page = 0;
      this.loadSubject.next();
    });

    // switchMap : une réponse tardive ne peut pas écraser une requête plus récente
    this.loadSubject
      .pipe(
        switchMap(() => {
          this.loading = true;
          return this.siteService
            .searchLieuxByClientId(this.clientId as number, this.search.trim(), { page: this.page, size: this.pageSize })
            .pipe(catchError(() => of(null)));
        })
      )
      .subscribe((res: HttpResponse<ISite[]> | null) => {
        if (res) {
          this.sites = res.body ?? [];
          this.totalItems = Number(res.headers.get('X-Total-Count') ?? this.sites.length);
        } else {
          this.sites = [];
          this.totalItems = 0;
        }
        this.loading = false;
      });

    this.loadSites();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
    this.loadSubject.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search.trim());
  }

  loadSites(): void {
    if (this.clientId === null || this.clientId === undefined) {
      this.sites = [];
      this.totalItems = 0;
      return;
    }
    this.loadSubject.next();
  }

  previousPage(): void {
    if (this.hasPrevious && !this.loading) {
      this.page -= 1;
      this.loadSites();
    }
  }

  nextPage(): void {
    if (this.hasNext && !this.loading) {
      this.page += 1;
      this.loadSites();
    }
  }

  choose(site: ISite): void {
    this.activeModal.close(site);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
