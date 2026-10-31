import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ParametreWOFormService, ParametreWOFormGroup } from './parametre-wo-form.service';
import { IParametreWO } from '../parametre-wo.model';
import { ParametreWOService } from '../service/parametre-wo.service';

@Component({
  selector: 'jhi-parametre-wo-update',
  templateUrl: './parametre-wo-update.component.html',
})
export class ParametreWOUpdateComponent implements OnInit {
  isSaving = false;
  parametreWO: IParametreWO | null = null;

  editForm: ParametreWOFormGroup = this.parametreWOFormService.createParametreWOFormGroup();

  constructor(
    protected parametreWOService: ParametreWOService,
    protected parametreWOFormService: ParametreWOFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ parametreWO }) => {
      this.parametreWO = parametreWO;
      if (parametreWO) {
        this.updateForm(parametreWO);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const parametreWO = this.parametreWOFormService.getParametreWO(this.editForm);
    if (parametreWO.id !== null) {
      this.subscribeToSaveResponse(this.parametreWOService.update(parametreWO));
    } else {
      this.subscribeToSaveResponse(this.parametreWOService.create(parametreWO));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IParametreWO>>): void {
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

  protected updateForm(parametreWO: IParametreWO): void {
    this.parametreWO = parametreWO;
    this.parametreWOFormService.resetForm(this.editForm, parametreWO);
  }
}
