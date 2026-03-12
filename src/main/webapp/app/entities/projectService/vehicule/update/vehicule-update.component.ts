import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { VehiculeFormService, VehiculeFormGroup } from './vehicule-form.service';
import { IVehicule } from '../vehicule.model';
import { VehiculeService } from '../service/vehicule.service';
import { IAgence } from 'app/entities/projectService/agence/agence.model';
import { AgenceService } from 'app/entities/projectService/agence/service/agence.service';
import { StatutVehicule } from 'app/entities/enumerations/statut-vehicule.model';

@Component({
  selector: 'jhi-vehicule-update',
  templateUrl: './vehicule-update.component.html',
})
export class VehiculeUpdateComponent implements OnInit {
  isSaving = false;
  vehicule: IVehicule | null = null;
  statutVehiculeValues = Object.keys(StatutVehicule);

  agencesSharedCollection: IAgence[] = [];

  editForm: VehiculeFormGroup = this.vehiculeFormService.createVehiculeFormGroup();

  constructor(
    protected vehiculeService: VehiculeService,
    protected vehiculeFormService: VehiculeFormService,
    protected agenceService: AgenceService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareAgence = (o1: IAgence | null, o2: IAgence | null): boolean => this.agenceService.compareAgence(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ vehicule }) => {
      this.vehicule = vehicule;
      if (vehicule) {
        this.updateForm(vehicule);
      }

      this.loadRelationshipsOptions();
    });
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

    this.agencesSharedCollection = this.agenceService.addAgenceToCollectionIfMissing<IAgence>(
      this.agencesSharedCollection,
      vehicule.agence
    );
  }

  protected loadRelationshipsOptions(): void {
    this.agenceService
      .query()
      .pipe(map((res: HttpResponse<IAgence[]>) => res.body ?? []))
      .pipe(map((agences: IAgence[]) => this.agenceService.addAgenceToCollectionIfMissing<IAgence>(agences, this.vehicule?.agence)))
      .subscribe((agences: IAgence[]) => (this.agencesSharedCollection = agences));
  }
}
