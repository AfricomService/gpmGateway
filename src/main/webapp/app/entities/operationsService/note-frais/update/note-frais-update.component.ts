import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { NoteFraisFormService, NoteFraisFormGroup } from './note-frais-form.service';
import { INoteFrais } from '../note-frais.model';
import { NoteFraisService } from '../service/note-frais.service';

@Component({
  selector: 'jhi-note-frais-update',
  templateUrl: './note-frais-update.component.html',
})
export class NoteFraisUpdateComponent implements OnInit {
  isSaving = false;
  noteFrais: INoteFrais | null = null;

  editForm: NoteFraisFormGroup = this.noteFraisFormService.createNoteFraisFormGroup();

  constructor(
    protected noteFraisService: NoteFraisService,
    protected noteFraisFormService: NoteFraisFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ noteFrais }) => {
      this.noteFrais = noteFrais;
      if (noteFrais) {
        this.updateForm(noteFrais);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const noteFrais = this.noteFraisFormService.getNoteFrais(this.editForm);
    if (noteFrais.id !== null) {
      this.subscribeToSaveResponse(this.noteFraisService.update(noteFrais));
    } else {
      this.subscribeToSaveResponse(this.noteFraisService.create(noteFrais));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<INoteFrais>>): void {
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

  protected updateForm(noteFrais: INoteFrais): void {
    this.noteFrais = noteFrais;
    this.noteFraisFormService.resetForm(this.editForm, noteFrais);
  }
}
