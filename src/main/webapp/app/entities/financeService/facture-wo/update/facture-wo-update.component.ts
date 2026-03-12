import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { FactureWOFormService, FactureWOFormGroup } from './facture-wo-form.service';
import { IFactureWO } from '../facture-wo.model';
import { FactureWOService } from '../service/facture-wo.service';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { FactureService } from 'app/entities/financeService/facture/service/facture.service';

@Component({
  selector: 'jhi-facture-wo-update',
  templateUrl: './facture-wo-update.component.html',
})
export class FactureWOUpdateComponent implements OnInit {
  isSaving = false;
  factureWO: IFactureWO | null = null;

  facturesSharedCollection: IFacture[] = [];

  editForm: FactureWOFormGroup = this.factureWOFormService.createFactureWOFormGroup();

  constructor(
    protected factureWOService: FactureWOService,
    protected factureWOFormService: FactureWOFormService,
    protected factureService: FactureService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareFacture = (o1: IFacture | null, o2: IFacture | null): boolean => this.factureService.compareFacture(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ factureWO }) => {
      this.factureWO = factureWO;
      if (factureWO) {
        this.updateForm(factureWO);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const factureWO = this.factureWOFormService.getFactureWO(this.editForm);
    if (factureWO.id !== null) {
      this.subscribeToSaveResponse(this.factureWOService.update(factureWO));
    } else {
      this.subscribeToSaveResponse(this.factureWOService.create(factureWO));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFactureWO>>): void {
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

  protected updateForm(factureWO: IFactureWO): void {
    this.factureWO = factureWO;
    this.factureWOFormService.resetForm(this.editForm, factureWO);

    this.facturesSharedCollection = this.factureService.addFactureToCollectionIfMissing<IFacture>(
      this.facturesSharedCollection,
      factureWO.facture
    );
  }

  protected loadRelationshipsOptions(): void {
    this.factureService
      .query()
      .pipe(map((res: HttpResponse<IFacture[]>) => res.body ?? []))
      .pipe(map((factures: IFacture[]) => this.factureService.addFactureToCollectionIfMissing<IFacture>(factures, this.factureWO?.facture)))
      .subscribe((factures: IFacture[]) => (this.facturesSharedCollection = factures));
  }
}
