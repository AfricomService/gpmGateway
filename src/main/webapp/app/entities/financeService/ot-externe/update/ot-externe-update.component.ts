import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { OtExterneFormService, OtExterneFormGroup } from './ot-externe-form.service';
import { IOtExterne } from '../ot-externe.model';
import { OtExterneService } from '../service/ot-externe.service';
import { StatutOtExterne } from 'app/entities/enumerations/statut-ot-externe.model';

@Component({
  selector: 'jhi-ot-externe-update',
  templateUrl: './ot-externe-update.component.html',
})
export class OtExterneUpdateComponent implements OnInit {
  isSaving = false;
  otExterne: IOtExterne | null = null;
  statutOtExterneValues = Object.keys(StatutOtExterne);

  editForm: OtExterneFormGroup = this.otExterneFormService.createOtExterneFormGroup();

  constructor(
    protected otExterneService: OtExterneService,
    protected otExterneFormService: OtExterneFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ otExterne }) => {
      this.otExterne = otExterne;
      if (otExterne) {
        this.updateForm(otExterne);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const otExterne = this.otExterneFormService.getOtExterne(this.editForm);
    if (otExterne.id !== null) {
      this.subscribeToSaveResponse(this.otExterneService.update(otExterne));
    } else {
      this.subscribeToSaveResponse(this.otExterneService.create(otExterne));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOtExterne>>): void {
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

  protected updateForm(otExterne: IOtExterne): void {
    this.otExterne = otExterne;
    this.otExterneFormService.resetForm(this.editForm, otExterne);
  }
}
