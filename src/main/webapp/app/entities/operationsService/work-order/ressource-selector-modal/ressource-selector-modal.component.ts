import { Component, Input, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IRessource } from 'app/entities/projectService/ressource/ressource.model';
import { RessourceService } from 'app/entities/projectService/ressource/service/ressource.service';
import { WorkOrderRessourceService } from '../service/work-order-ressource.service';

@Component({
  selector: 'jhi-ressource-selector-modal',
  templateUrl: './ressource-selector-modal.component.html',
  styleUrls: ['./ressource-selector-modal.component.scss'],
})
export class RessourceSelectorModalComponent implements OnInit {
  @Input() modalTitle = 'Sélectionner une ressource';
  @Input() multiple = false;
  @Input() initialSelection: IRessource[] = [];

  // Active la vérification de disponibilité (conflit avec un autre work order en cours)
  @Input() checkDisponibilite = true;

  // Work order courant à exclure du contrôle (mode édition)
  @Input() excludeWorkOrderId: number | null = null;

  // Société de l'affaire sélectionnée : les ressources affichées sont restreintes à cette société
  @Input() societeId: number | null = null;

  ressources: IRessource[] = [];
  filteredRessources: IRessource[] = [];
  loading = false;
  searchTerm = '';

  selectedRessources: IRessource[] = [];

  checkingRessourceId: number | null = null;
  conflictMessage: string | null = null;

  constructor(
    protected activeModal: NgbActiveModal,
    protected ressourceService: RessourceService,
    protected workOrderRessourceService: WorkOrderRessourceService
  ) {}

  ngOnInit(): void {
    this.selectedRessources = [...this.initialSelection];
    this.loadRessources();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  select(ressource: IRessource): void {
    if (!this.multiple) {
      if (this.checkDisponibilite) {
        this.verifyAndRun(ressource, () => this.activeModal.close(ressource));
      } else {
        this.activeModal.close(ressource);
      }
      return;
    }

    this.toggleSelection(ressource);
  }

  toggleSelection(ressource: IRessource): void {
    if (this.isSelected(ressource)) {
      this.selectedRessources = this.selectedRessources.filter(r => r.id !== ressource.id);
      return;
    }

    if (this.checkDisponibilite) {
      this.verifyAndRun(ressource, () => {
        this.selectedRessources = [...this.selectedRessources, ressource];
      });
    } else {
      this.selectedRessources = [...this.selectedRessources, ressource];
    }
  }

  private verifyAndRun(ressource: IRessource, onAvailable: () => void): void {
    if (ressource.id === null || ressource.id === undefined) {
      onAvailable();
      return;
    }

    this.conflictMessage = null;
    this.checkingRessourceId = ressource.id;

    this.workOrderRessourceService.checkDisponibilite([ressource.id], this.excludeWorkOrderId).subscribe({
      next: res => {
        this.checkingRessourceId = null;
        const conflicts = res.body ?? [];

        if (conflicts.length === 0) {
          onAvailable();
          return;
        }

        const conflict = conflicts[0];
        const dateFin = conflict.dateHeureFinPrev ? new Date(conflict.dateHeureFinPrev).toLocaleString() : '';

        this.conflictMessage =
          `${ressource.nom ?? 'Cette ressource'} est déjà affectée au work order ` +
          `${conflict.numFicheIntervention ?? conflict.workOrderId} (mission en cours jusqu'au ${dateFin}).`;
      },
      error: () => {
        this.checkingRessourceId = null;
        this.conflictMessage = 'Impossible de vérifier la disponibilité de la ressource pour le moment.';
      },
    });
  }

  isSelected(ressource: IRessource): boolean {
    return this.selectedRessources.some(r => r.id === ressource.id);
  }

  confirm(): void {
    this.activeModal.close(this.selectedRessources);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  private loadRessources(): void {
    if (this.societeId === null || this.societeId === undefined) {
      this.ressources = [];
      this.filteredRessources = [];
      this.loading = false;
      return;
    }

    this.loading = true;

    this.ressourceService.queryBySociete(this.societeId).subscribe({
      next: (res: HttpResponse<IRessource[]>) => {
        this.ressources = res.body ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.ressources = [];
        this.filteredRessources = [];
        this.loading = false;
      },
    });
  }

  private applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredRessources = !term
      ? this.ressources
      : this.ressources.filter(
          r =>
            (r.nom ?? '').toLowerCase().includes(term) ||
            (r.code ?? '').toLowerCase().includes(term) ||
            (r.categorie ?? '').toLowerCase().includes(term)
        );
  }
}
