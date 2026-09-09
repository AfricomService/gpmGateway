import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IBonCommande } from 'app/entities/financeService/bon-commande/bon-commande.model';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';

@Component({
  selector: 'jhi-bon-commande-selector-modal',
  templateUrl: './bon-commande-selector-modal.component.html',
  styleUrls: ['./bon-commande-selector-modal.component.scss'],
})
export class BonCommandeSelectorModalComponent implements OnInit {
  @Input() affaireId: number | null = null;
  @Input() statut: string | null = null;

  bonCommandes: IBonCommande[] = [];
  loading = false;
  searchTerm = '';

  constructor(public activeModal: NgbActiveModal, protected bonCommandeService: BonCommandeService) {}

  ngOnInit(): void {
    this.loadBonCommandes();
  }

  private loadBonCommandes(): void {
    if (this.affaireId === null || this.affaireId === undefined) {
      this.bonCommandes = [];
      return;
    }

    this.loading = true;

    this.bonCommandeService.findByAffaireId(this.affaireId, this.statut ?? undefined).subscribe({
      next: res => {
        this.bonCommandes = res.body ?? [];
        this.loading = false;
      },
      error: () => {
        this.bonCommandes = [];
        this.loading = false;
      },
    });
  }

  get filteredBonCommandes(): IBonCommande[] {
    if (!this.searchTerm.trim()) {
      return this.bonCommandes;
    }
    const term = this.searchTerm.trim().toLowerCase();
    return this.bonCommandes.filter(bc => (bc.identifiantUnique ?? '').toLowerCase().includes(term));
  }

  selectBonCommande(bonCommande: IBonCommande): void {
    this.activeModal.close(bonCommande);
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
