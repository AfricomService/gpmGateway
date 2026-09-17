import { Component, Input, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IVehicule } from 'app/entities/projectService/vehicule/vehicule.model';
import { VehiculeService } from 'app/entities/projectService/vehicule/service/vehicule.service';
import { WorkOrderVehiculeService } from '../service/work-order-vehicule.service';

@Component({
  selector: 'jhi-vehicule-selector-modal',
  templateUrl: './vehicule-selector-modal.component.html',
  styleUrls: ['./vehicule-selector-modal.component.scss'],
})
export class VehiculeSelectorModalComponent implements OnInit {
  @Input() modalTitle = 'Sélectionner un véhicule';
  @Input() multiple = false;
  @Input() initialSelection: IVehicule[] = [];

  // Active la vérification de disponibilité (conflit avec un autre work order en cours)
  @Input() checkDisponibilite = true;

  // Work order courant à exclure du contrôle (mode édition)
  @Input() excludeWorkOrderId: number | null = null;

  vehicules: IVehicule[] = [];
  filteredVehicules: IVehicule[] = [];
  loading = false;
  searchTerm = '';

  selectedVehicules: IVehicule[] = [];

  checkingVehiculeId: number | null = null;
  conflictMessage: string | null = null;

  constructor(
    protected activeModal: NgbActiveModal,
    protected vehiculeService: VehiculeService,
    protected workOrderVehiculeService: WorkOrderVehiculeService
  ) {}

  ngOnInit(): void {
    this.selectedVehicules = [...this.initialSelection];
    this.loadVehicules();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  select(vehicule: IVehicule): void {
    if (!this.multiple) {
      if (this.checkDisponibilite) {
        this.verifyAndRun(vehicule, () => this.activeModal.close(vehicule));
      } else {
        this.activeModal.close(vehicule);
      }
      return;
    }

    this.toggleSelection(vehicule);
  }

  toggleSelection(vehicule: IVehicule): void {
    if (this.isSelected(vehicule)) {
      this.selectedVehicules = this.selectedVehicules.filter(v => v.id !== vehicule.id);
      return;
    }

    if (this.checkDisponibilite) {
      this.verifyAndRun(vehicule, () => {
        this.selectedVehicules = [...this.selectedVehicules, vehicule];
      });
    } else {
      this.selectedVehicules = [...this.selectedVehicules, vehicule];
    }
  }

  private verifyAndRun(vehicule: IVehicule, onAvailable: () => void): void {
    if (vehicule.id === null || vehicule.id === undefined) {
      onAvailable();
      return;
    }

    this.conflictMessage = null;
    this.checkingVehiculeId = vehicule.id;

    this.workOrderVehiculeService.checkDisponibilite([vehicule.id], this.excludeWorkOrderId).subscribe({
      next: res => {
        this.checkingVehiculeId = null;
        const conflicts = res.body ?? [];

        if (conflicts.length === 0) {
          onAvailable();
          return;
        }

        const conflict = conflicts[0];
        const dateFin = conflict.dateHeureFinPrev ? new Date(conflict.dateHeureFinPrev).toLocaleString() : '';

        this.conflictMessage =
          `${vehicule.matricule ?? 'Ce véhicule'} est déjà affecté au work order ` +
          `${conflict.numFicheIntervention ?? conflict.workOrderId} (mission en cours jusqu'au ${dateFin}).`;
      },
      error: () => {
        this.checkingVehiculeId = null;
        this.conflictMessage = 'Impossible de vérifier la disponibilité du véhicule pour le moment.';
      },
    });
  }

  isSelected(vehicule: IVehicule): boolean {
    return this.selectedVehicules.some(v => v.id === vehicule.id);
  }

  confirm(): void {
    this.activeModal.close(this.selectedVehicules);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  private loadVehicules(): void {
    this.loading = true;

    this.vehiculeService.query().subscribe({
      next: (res: HttpResponse<IVehicule[]>) => {
        this.vehicules = res.body ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.vehicules = [];
        this.filteredVehicules = [];
        this.loading = false;
      },
    });
  }

  private applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredVehicules = !term
      ? this.vehicules
      : this.vehicules.filter(
          v =>
            (v.matricule ?? '').toLowerCase().includes(term) ||
            (v.marque ?? '').toLowerCase().includes(term) ||
            (v.type ?? '').toLowerCase().includes(term)
        );
  }
}
