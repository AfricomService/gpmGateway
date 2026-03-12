import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DepenseDiverseFormService, DepenseDiverseFormGroup } from './depense-diverse-form.service';
import { IDepenseDiverse } from '../depense-diverse.model';
import { DepenseDiverseService } from '../service/depense-diverse.service';

@Component({
  selector: 'jhi-depense-diverse-update',
  templateUrl: './depense-diverse-update.component.html',
})
export class DepenseDiverseUpdateComponent implements OnInit {
  isSaving = false;
  depenseDiverse: IDepenseDiverse | null = null;

  editForm: DepenseDiverseFormGroup = this.depenseDiverseFormService.createDepenseDiverseFormGroup();

  constructor(
    protected depenseDiverseService: DepenseDiverseService,
    protected depenseDiverseFormService: DepenseDiverseFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ depenseDiverse }) => {
      this.depenseDiverse = depenseDiverse;
      if (depenseDiverse) {
        this.updateForm(depenseDiverse);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const depenseDiverse = this.depenseDiverseFormService.getDepenseDiverse(this.editForm);
    if (depenseDiverse.id !== null) {
      this.subscribeToSaveResponse(this.depenseDiverseService.update(depenseDiverse));
    } else {
      this.subscribeToSaveResponse(this.depenseDiverseService.create(depenseDiverse));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDepenseDiverse>>): void {
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

  protected updateForm(depenseDiverse: IDepenseDiverse): void {
    this.depenseDiverse = depenseDiverse;
    this.depenseDiverseFormService.resetForm(this.editForm, depenseDiverse);
  }
}
