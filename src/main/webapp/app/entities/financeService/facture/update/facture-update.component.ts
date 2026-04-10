import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { FactureFormService, FactureFormGroup } from './facture-form.service';
import { IFacture } from '../facture.model';
import { FactureService } from '../service/facture.service';
import { StatutFacture } from 'app/entities/enumerations/statut-facture.model';

@Component({
  selector: 'jhi-facture-update',
  templateUrl: './facture-update.component.html',
})
export class FactureUpdateComponent implements OnInit {
  isSaving = false;
  facture: IFacture | null = null;
  statutFactureValues = Object.keys(StatutFacture);
  clientIdFromQuery: number | null = null;

  editForm: FactureFormGroup = this.factureFormService.createFactureFormGroup();

  constructor(
    protected factureService: FactureService,
    protected factureFormService: FactureFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const rawClientId = params.get('clientId');
      const parsedClientId = rawClientId ? Number(rawClientId) : null;
      this.clientIdFromQuery = parsedClientId !== null && !Number.isNaN(parsedClientId) ? parsedClientId : null;
      this.applyClientIdFromQueryParam();
    });

    this.activatedRoute.data.subscribe(({ facture }) => {
      this.facture = facture;
      if (facture) {
        this.updateForm(facture);
      }

      this.applyClientIdFromQueryParam();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const facture = this.factureFormService.getFacture(this.editForm);
    if (facture.id !== null) {
      this.subscribeToSaveResponse(this.factureService.update(facture));
    } else {
      this.subscribeToSaveResponse(this.factureService.create(facture));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFacture>>): void {
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

  protected updateForm(facture: IFacture): void {
    this.facture = facture;
    this.factureFormService.resetForm(this.editForm, facture);
  }

  protected applyClientIdFromQueryParam(): void {
    if (this.clientIdFromQuery === null || this.editForm.controls.id.value !== null) {
      return;
    }

    this.editForm.patchValue({ clientId: this.clientIdFromQuery });
  }
}
