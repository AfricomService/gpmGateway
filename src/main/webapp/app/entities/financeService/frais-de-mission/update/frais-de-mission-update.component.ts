import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { FraisDeMissionFormService, FraisDeMissionFormGroup } from './frais-de-mission-form.service';
import { IFraisDeMission } from '../frais-de-mission.model';
import { FraisDeMissionService } from '../service/frais-de-mission.service';
import { StatutFraisDeMission } from 'app/entities/enumerations/statut-frais-de-mission.model';

@Component({
  selector: 'jhi-frais-de-mission-update',
  templateUrl: './frais-de-mission-update.component.html',
})
export class FraisDeMissionUpdateComponent implements OnInit {
  isSaving = false;
  fraisDeMission: IFraisDeMission | null = null;
  statutFraisDeMissionValues = Object.keys(StatutFraisDeMission);

  editForm: FraisDeMissionFormGroup = this.fraisDeMissionFormService.createFraisDeMissionFormGroup();

  constructor(
    protected fraisDeMissionService: FraisDeMissionService,
    protected fraisDeMissionFormService: FraisDeMissionFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ fraisDeMission }) => {
      this.fraisDeMission = fraisDeMission;
      if (fraisDeMission) {
        this.updateForm(fraisDeMission);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const fraisDeMission = this.fraisDeMissionFormService.getFraisDeMission(this.editForm);
    if (fraisDeMission.id !== null) {
      this.subscribeToSaveResponse(this.fraisDeMissionService.update(fraisDeMission));
    } else {
      this.subscribeToSaveResponse(this.fraisDeMissionService.create(fraisDeMission));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFraisDeMission>>): void {
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

  protected updateForm(fraisDeMission: IFraisDeMission): void {
    this.fraisDeMission = fraisDeMission;
    this.fraisDeMissionFormService.resetForm(this.editForm, fraisDeMission);
  }
}
