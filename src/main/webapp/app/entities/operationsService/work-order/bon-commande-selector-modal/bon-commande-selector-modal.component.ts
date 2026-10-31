import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IBonCommande } from 'app/entities/financeService/bon-commande/bon-commande.model';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';

const BON_COMMANDE_PAGE_SIZE = 10;

@Component({
  selector: 'jhi-bon-commande-selector-modal',
  templateUrl: './bon-commande-selector-modal.component.html',
  // On réutilise le style du modal Affaire (mêmes classes .affaire-modal-*)
  styleUrls: ['../../../financeService/bon-commande/affaire-selector-modal/affaire-selector-modal.component.scss'],
})
export class BonCommandeSelectorModalComponent implements OnInit, OnDestroy {
  /** Id du bon de commande actuellement sélectionné (pour le surligner). */
  @Input() selectedId: number | null = null;

  bonCommandes: IBonCommande[] = [];
  search = '';
  loading = false;

  // ngb-pagination est en base 1, l'API en base 0
  page = 1;
  pageSize = BON_COMMANDE_PAGE_SIZE;
  totalItems = 0;

  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private loadSubscription?: Subscription;

  constructor(public activeModal: NgbActiveModal, private bonCommandeService: BonCommandeService) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.loadBonCommandes();
    });

    this.loadBonCommandes();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.loadSubscription?.unsubscribe();
    this.searchSubject.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search.trim());
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadBonCommandes();
  }

  loadBonCommandes(): void {
    // Annule la requête précédente encore en cours (évite les réponses dans le désordre)
    this.loadSubscription?.unsubscribe();
    this.loading = true;

    this.loadSubscription = this.bonCommandeService
      .query({
        page: this.page - 1,
        size: this.pageSize,
        sort: ['id,desc'],
        search: this.search.trim(),
      })
      .subscribe({
        next: (res: HttpResponse<IBonCommande[]>) => {
          this.bonCommandes = res.body ?? [];
          this.totalItems = Number(res.headers.get('X-Total-Count') ?? this.bonCommandes.length);
          this.loading = false;
        },
        error: () => {
          this.bonCommandes = [];
          this.totalItems = 0;
          this.loading = false;
        },
      });
  }

  choose(bonCommande: IBonCommande): void {
    this.activeModal.close(bonCommande);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
