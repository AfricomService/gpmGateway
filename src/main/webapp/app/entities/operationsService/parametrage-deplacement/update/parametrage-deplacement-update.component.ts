import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ParametrageDeplacementFormService, ParametrageDeplacementFormGroup } from './parametrage-deplacement-form.service';
import { IParametrageDeplacement } from '../parametrage-deplacement.model';
import { ParametrageDeplacementService } from '../service/parametrage-deplacement.service';

@Component({
  selector: 'jhi-parametrage-deplacement-update',
  templateUrl: './parametrage-deplacement-update.component.html',
})
export class ParametrageDeplacementUpdateComponent implements OnInit {
  isSaving = false;
  parametrageDeplacement: IParametrageDeplacement | null = null;

  editForm: ParametrageDeplacementFormGroup = this.parametrageDeplacementFormService.createParametrageDeplacementFormGroup();

  constructor(
    protected parametrageDeplacementService: ParametrageDeplacementService,
    protected parametrageDeplacementFormService: ParametrageDeplacementFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ parametrageDeplacement }) => {
      this.parametrageDeplacement = parametrageDeplacement;
      if (parametrageDeplacement) {
        this.updateForm(parametrageDeplacement);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const parametrageDeplacement = this.parametrageDeplacementFormService.getParametrageDeplacement(this.editForm);
    if (parametrageDeplacement.id !== null) {
      this.subscribeToSaveResponse(this.parametrageDeplacementService.update(parametrageDeplacement));
    } else {
      this.subscribeToSaveResponse(this.parametrageDeplacementService.create(parametrageDeplacement));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IParametrageDeplacement>>): void {
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

  protected updateForm(parametrageDeplacement: IParametrageDeplacement): void {
    this.parametrageDeplacement = parametrageDeplacement;
    this.parametrageDeplacementFormService.resetForm(this.editForm, parametrageDeplacement);
  }
}
