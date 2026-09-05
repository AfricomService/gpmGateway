import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ISite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';

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

  allSites: ISite[] = [];
  sites: ISite[] = [];

  search = '';

  loading = false;

  private readonly searchSubject = new Subject<string>();

  constructor(public activeModal: NgbActiveModal, private siteService: SiteService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(search => {
      this.applyFilter(search);
    });

    this.loadSites();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  loadSites(): void {
    if (this.clientId === null || this.clientId === undefined) {
      this.allSites = [];
      this.sites = [];
      return;
    }

    this.loading = true;

    this.siteService.findByClientId(this.clientId).subscribe({
      next: (res: HttpResponse<ISite[]>) => {
        this.allSites = res.body ?? [];
        this.applyFilter(this.search);
        this.loading = false;
      },
      error: () => {
        this.allSites = [];
        this.sites = [];
        this.loading = false;
      },
    });
  }

  private applyFilter(search: string): void {
    const term = search.trim().toLowerCase();

    this.sites = !term
      ? this.allSites
      : this.allSites.filter(
          site => (site.designation?.toLowerCase() ?? '').includes(term) || (site.code?.toLowerCase() ?? '').includes(term)
        );
  }

  choose(site: ISite): void {
    this.activeModal.close(site);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
