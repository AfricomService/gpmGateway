import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ActiviteFormService, ActiviteFormGroup } from './activite-form.service';
import { IActivite } from '../activite.model';
import { ActiviteService } from '../service/activite.service';

@Component({
  selector: 'jhi-activite-update',
  templateUrl: './activite-update.component.html',
})
export class ActiviteUpdateComponent implements OnInit {
  isSaving = false;
  activite: IActivite | null = null;

  editForm: ActiviteFormGroup = this.activiteFormService.createActiviteFormGroup();

  constructor(
    protected activiteService: ActiviteService,
    protected activiteFormService: ActiviteFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ activite }) => {
      this.activite = activite;
      if (activite) {
        this.updateForm(activite);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const activite = this.activiteFormService.getActivite(this.editForm);
    if (activite.id !== null) {
      this.subscribeToSaveResponse(this.activiteService.update(activite));
    } else {
      this.subscribeToSaveResponse(this.activiteService.create(activite));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IActivite>>): void {
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

  protected updateForm(activite: IActivite): void {
    this.activite = activite;
    this.activiteFormService.resetForm(this.editForm, activite);
  }
}
