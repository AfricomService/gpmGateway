import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DevisFormService, DevisFormGroup } from './devis-form.service';
import { IDevis } from '../devis.model';
import { DevisService } from '../service/devis.service';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { FactureService } from 'app/entities/financeService/facture/service/facture.service';
import { StatutDevis } from 'app/entities/enumerations/statut-devis.model';

@Component({
  selector: 'jhi-devis-update',
  templateUrl: './devis-update.component.html',
})
export class DevisUpdateComponent implements OnInit {
  isSaving = false;
  devis: IDevis | null = null;
  statutDevisValues = Object.keys(StatutDevis);

  facturesSharedCollection: IFacture[] = [];

  editForm: DevisFormGroup = this.devisFormService.createDevisFormGroup();

  constructor(
    protected devisService: DevisService,
    protected devisFormService: DevisFormService,
    protected factureService: FactureService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareFacture = (o1: IFacture | null, o2: IFacture | null): boolean => this.factureService.compareFacture(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ devis }) => {
      this.devis = devis;
      if (devis) {
        this.updateForm(devis);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const devis = this.devisFormService.getDevis(this.editForm);
    if (devis.id !== null) {
      this.subscribeToSaveResponse(this.devisService.update(devis));
    } else {
      this.subscribeToSaveResponse(this.devisService.create(devis));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDevis>>): void {
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

  protected updateForm(devis: IDevis): void {
    this.devis = devis;
    this.devisFormService.resetForm(this.editForm, devis);

    this.facturesSharedCollection = this.factureService.addFactureToCollectionIfMissing<IFacture>(
      this.facturesSharedCollection,
      devis.facture
    );
  }

  protected loadRelationshipsOptions(): void {
    this.factureService
      .query()
      .pipe(map((res: HttpResponse<IFacture[]>) => res.body ?? []))
      .pipe(map((factures: IFacture[]) => this.factureService.addFactureToCollectionIfMissing<IFacture>(factures, this.devis?.facture)))
      .subscribe((factures: IFacture[]) => (this.facturesSharedCollection = factures));
  }
}
