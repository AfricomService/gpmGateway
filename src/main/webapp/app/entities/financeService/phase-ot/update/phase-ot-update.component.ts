import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PhaseOtFormService, PhaseOtFormGroup } from './phase-ot-form.service';
import { IPhaseOt } from '../phase-ot.model';
import { PhaseOtService } from '../service/phase-ot.service';

@Component({
  selector: 'jhi-phase-ot-update',
  templateUrl: './phase-ot-update.component.html',
})
export class PhaseOtUpdateComponent implements OnInit {
  isSaving = false;
  phaseOt: IPhaseOt | null = null;

  editForm: PhaseOtFormGroup = this.phaseOtFormService.createPhaseOtFormGroup();

  constructor(
    protected phaseOtService: PhaseOtService,
    protected phaseOtFormService: PhaseOtFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ phaseOt }) => {
      this.phaseOt = phaseOt;
      if (phaseOt) {
        this.updateForm(phaseOt);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const phaseOt = this.phaseOtFormService.getPhaseOt(this.editForm);
    if (phaseOt.id !== null) {
      this.subscribeToSaveResponse(this.phaseOtService.update(phaseOt));
    } else {
      this.subscribeToSaveResponse(this.phaseOtService.create(phaseOt));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPhaseOt>>): void {
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

  protected updateForm(phaseOt: IPhaseOt): void {
    this.phaseOt = phaseOt;
    this.phaseOtFormService.resetForm(this.editForm, phaseOt);
  }
}
