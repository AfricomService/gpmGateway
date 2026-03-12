import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { JourFerieFormService, JourFerieFormGroup } from './jour-ferie-form.service';
import { IJourFerie } from '../jour-ferie.model';
import { JourFerieService } from '../service/jour-ferie.service';

@Component({
  selector: 'jhi-jour-ferie-update',
  templateUrl: './jour-ferie-update.component.html',
})
export class JourFerieUpdateComponent implements OnInit {
  isSaving = false;
  jourFerie: IJourFerie | null = null;

  editForm: JourFerieFormGroup = this.jourFerieFormService.createJourFerieFormGroup();

  constructor(
    protected jourFerieService: JourFerieService,
    protected jourFerieFormService: JourFerieFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ jourFerie }) => {
      this.jourFerie = jourFerie;
      if (jourFerie) {
        this.updateForm(jourFerie);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const jourFerie = this.jourFerieFormService.getJourFerie(this.editForm);
    if (jourFerie.id !== null) {
      this.subscribeToSaveResponse(this.jourFerieService.update(jourFerie));
    } else {
      this.subscribeToSaveResponse(this.jourFerieService.create(jourFerie));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IJourFerie>>): void {
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

  protected updateForm(jourFerie: IJourFerie): void {
    this.jourFerie = jourFerie;
    this.jourFerieFormService.resetForm(this.editForm, jourFerie);
  }
}
