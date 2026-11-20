import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INoteFrais } from '../note-frais.model';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';

type AccordionPanel = 'general' | 'montants';

@Component({
  selector: 'jhi-note-frais-detail',
  templateUrl: './note-frais-detail.component.html',
  styleUrls: ['./note-frais-detail.component.scss'],
})
export class NoteFraisDetailComponent implements OnInit {
  noteFrais: INoteFrais | null = null;

  // Nom du bénéficiaire (retrouvé à partir de contactSocieteId)
  beneficiaireLabel = '';

  // Accordéon (état purement visuel)
  openPanels: Set<AccordionPanel> = new Set<AccordionPanel>(['general', 'montants']);

  constructor(protected activatedRoute: ActivatedRoute, protected bonCommandeService: BonCommandeService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ noteFrais }) => {
      this.noteFrais = noteFrais;
      this.loadBeneficiaire();
    });
  }

  togglePanel(panel: AccordionPanel): void {
    if (this.openPanels.has(panel)) {
      this.openPanels.delete(panel);
    } else {
      this.openPanels.add(panel);
    }
  }

  isPanelOpen(panel: AccordionPanel): boolean {
    return this.openPanels.has(panel);
  }

  previousState(): void {
    window.history.back();
  }

  private loadBeneficiaire(): void {
    const id = this.noteFrais?.contactSocieteId;
    if (id === null || id === undefined) {
      this.beneficiaireLabel = '';
      return;
    }

    this.beneficiaireLabel = 'Chargement...';
    this.bonCommandeService.findResponsableById(Number(id)).subscribe({
      next: res => (this.beneficiaireLabel = res.body?.nomPrenom ?? '—'),
      error: () => (this.beneficiaireLabel = '—'),
    });
  }
}
