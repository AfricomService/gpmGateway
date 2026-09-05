import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { VehiculeFormService, VehiculeFormGroup } from './vehicule-form.service';
import { IVehicule } from '../vehicule.model';
import { VehiculeService } from '../service/vehicule.service';
import { StatutVehicule } from 'app/entities/enumerations/statut-vehicule.model';

type AccordionSection = 'general' | 'technique' | 'affectation';

@Component({
  selector: 'jhi-vehicule-update',
  templateUrl: './vehicule-update.component.html',
  styleUrls: ['./vehicule-update.component.scss'],
})
export class VehiculeUpdateComponent implements OnInit {
  isSaving = false;
  vehicule: IVehicule | null = null;
  statutVehiculeValues = Object.keys(StatutVehicule);

  editForm: VehiculeFormGroup = this.vehiculeFormService.createVehiculeFormGroup();

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general', 'technique', 'affectation']);

  constructor(
    protected vehiculeService: VehiculeService,
    protected vehiculeFormService: VehiculeFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ vehicule }) => {
      this.vehicule = vehicule;
      if (vehicule) {
        this.updateForm(vehicule);
      }
    });
  }

  // === Accordéon ===
  toggleSection(section: AccordionSection): void {
    if (this.openSections.has(section)) {
      this.openSections.delete(section);
    } else {
      this.openSections.add(section);
    }
  }

  isSectionOpen(section: AccordionSection): boolean {
    return this.openSections.has(section);
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const vehicule = this.vehiculeFormService.getVehicule(this.editForm);
    if (vehicule.id !== null) {
      this.subscribeToSaveResponse(this.vehiculeService.update(vehicule));
    } else {
      this.subscribeToSaveResponse(this.vehiculeService.create(vehicule));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IVehicule>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(vehicule: IVehicule): void {
    this.vehicule = vehicule;
    this.vehiculeFormService.resetForm(this.editForm, vehicule);
  }
}
