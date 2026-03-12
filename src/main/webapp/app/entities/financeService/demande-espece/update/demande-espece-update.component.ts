import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DemandeEspeceFormService, DemandeEspeceFormGroup } from './demande-espece-form.service';
import { IDemandeEspece } from '../demande-espece.model';
import { DemandeEspeceService } from '../service/demande-espece.service';

@Component({
  selector: 'jhi-demande-espece-update',
  templateUrl: './demande-espece-update.component.html',
})
export class DemandeEspeceUpdateComponent implements OnInit {
  isSaving = false;
  demandeEspece: IDemandeEspece | null = null;

  editForm: DemandeEspeceFormGroup = this.demandeEspeceFormService.createDemandeEspeceFormGroup();

  constructor(
    protected demandeEspeceService: DemandeEspeceService,
    protected demandeEspeceFormService: DemandeEspeceFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ demandeEspece }) => {
      this.demandeEspece = demandeEspece;
      if (demandeEspece) {
        this.updateForm(demandeEspece);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const demandeEspece = this.demandeEspeceFormService.getDemandeEspece(this.editForm);
    if (demandeEspece.id !== null) {
      this.subscribeToSaveResponse(this.demandeEspeceService.update(demandeEspece));
    } else {
      this.subscribeToSaveResponse(this.demandeEspeceService.create(demandeEspece));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDemandeEspece>>): void {
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

  protected updateForm(demandeEspece: IDemandeEspece): void {
    this.demandeEspece = demandeEspece;
    this.demandeEspeceFormService.resetForm(this.editForm, demandeEspece);
  }
}
