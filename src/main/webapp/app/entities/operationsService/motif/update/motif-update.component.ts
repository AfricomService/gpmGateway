import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MotifFormService, MotifFormGroup } from './motif-form.service';
import { IMotif } from '../motif.model';
import { MotifService } from '../service/motif.service';

@Component({
  selector: 'jhi-motif-update',
  templateUrl: './motif-update.component.html',
})
export class MotifUpdateComponent implements OnInit {
  isSaving = false;
  motif: IMotif | null = null;

  editForm: MotifFormGroup = this.motifFormService.createMotifFormGroup();

  constructor(
    protected motifService: MotifService,
    protected motifFormService: MotifFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ motif }) => {
      this.motif = motif;
      if (motif) {
        this.updateForm(motif);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const motif = this.motifFormService.getMotif(this.editForm);
    if (motif.id !== null) {
      this.subscribeToSaveResponse(this.motifService.update(motif));
    } else {
      this.subscribeToSaveResponse(this.motifService.create(motif));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMotif>>): void {
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

  protected updateForm(motif: IMotif): void {
    this.motif = motif;
    this.motifFormService.resetForm(this.editForm, motif);
  }
}
