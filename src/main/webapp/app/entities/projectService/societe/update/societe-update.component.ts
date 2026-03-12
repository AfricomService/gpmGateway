import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SocieteFormService, SocieteFormGroup } from './societe-form.service';
import { ISociete } from '../societe.model';
import { SocieteService } from '../service/societe.service';

@Component({
  selector: 'jhi-societe-update',
  templateUrl: './societe-update.component.html',
})
export class SocieteUpdateComponent implements OnInit {
  isSaving = false;
  societe: ISociete | null = null;

  editForm: SocieteFormGroup = this.societeFormService.createSocieteFormGroup();

  constructor(
    protected societeService: SocieteService,
    protected societeFormService: SocieteFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ societe }) => {
      this.societe = societe;
      if (societe) {
        this.updateForm(societe);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const societe = this.societeFormService.getSociete(this.editForm);
    if (societe.id !== null) {
      this.subscribeToSaveResponse(this.societeService.update(societe));
    } else {
      this.subscribeToSaveResponse(this.societeService.create(societe));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISociete>>): void {
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

  protected updateForm(societe: ISociete): void {
    this.societe = societe;
    this.societeFormService.resetForm(this.editForm, societe);
  }
}
