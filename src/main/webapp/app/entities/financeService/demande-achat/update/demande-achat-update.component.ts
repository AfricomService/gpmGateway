import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DemandeAchatFormService, DemandeAchatFormGroup } from './demande-achat-form.service';
import { IDemandeAchat } from '../demande-achat.model';
import { DemandeAchatService } from '../service/demande-achat.service';
import { StatutDemandeAchat } from 'app/entities/enumerations/statut-demande-achat.model';
import { TypeDemandeAchat } from 'app/entities/enumerations/type-demande-achat.model';

@Component({
  selector: 'jhi-demande-achat-update',
  templateUrl: './demande-achat-update.component.html',
})
export class DemandeAchatUpdateComponent implements OnInit {
  isSaving = false;
  demandeAchat: IDemandeAchat | null = null;
  statutDemandeAchatValues = Object.keys(StatutDemandeAchat);
  typeDemandeAchatValues = Object.keys(TypeDemandeAchat);

  editForm: DemandeAchatFormGroup = this.demandeAchatFormService.createDemandeAchatFormGroup();

  constructor(
    protected demandeAchatService: DemandeAchatService,
    protected demandeAchatFormService: DemandeAchatFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ demandeAchat }) => {
      this.demandeAchat = demandeAchat;
      if (demandeAchat) {
        this.updateForm(demandeAchat);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const demandeAchat = this.demandeAchatFormService.getDemandeAchat(this.editForm);
    if (demandeAchat.id !== null) {
      this.subscribeToSaveResponse(this.demandeAchatService.update(demandeAchat));
    } else {
      this.subscribeToSaveResponse(this.demandeAchatService.create(demandeAchat));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDemandeAchat>>): void {
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

  protected updateForm(demandeAchat: IDemandeAchat): void {
    this.demandeAchat = demandeAchat;
    this.demandeAchatFormService.resetForm(this.editForm, demandeAchat);
  }
}
