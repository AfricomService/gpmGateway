import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { MatriceJourFerieFormService, MatriceJourFerieFormGroup } from './matrice-jour-ferie-form.service';
import { IMatriceJourFerie } from '../matrice-jour-ferie.model';
import { MatriceJourFerieService } from '../service/matrice-jour-ferie.service';
import { IMatriceFacturation } from 'app/entities/projectService/matrice-facturation/matrice-facturation.model';
import { MatriceFacturationService } from 'app/entities/projectService/matrice-facturation/service/matrice-facturation.service';
import { IJourFerie } from 'app/entities/projectService/jour-ferie/jour-ferie.model';
import { JourFerieService } from 'app/entities/projectService/jour-ferie/service/jour-ferie.service';

@Component({
  selector: 'jhi-matrice-jour-ferie-update',
  templateUrl: './matrice-jour-ferie-update.component.html',
})
export class MatriceJourFerieUpdateComponent implements OnInit {
  isSaving = false;
  matriceJourFerie: IMatriceJourFerie | null = null;

  matriceFacturationsSharedCollection: IMatriceFacturation[] = [];
  jourFeriesSharedCollection: IJourFerie[] = [];

  editForm: MatriceJourFerieFormGroup = this.matriceJourFerieFormService.createMatriceJourFerieFormGroup();

  constructor(
    protected matriceJourFerieService: MatriceJourFerieService,
    protected matriceJourFerieFormService: MatriceJourFerieFormService,
    protected matriceFacturationService: MatriceFacturationService,
    protected jourFerieService: JourFerieService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareMatriceFacturation = (o1: IMatriceFacturation | null, o2: IMatriceFacturation | null): boolean =>
    this.matriceFacturationService.compareMatriceFacturation(o1, o2);

  compareJourFerie = (o1: IJourFerie | null, o2: IJourFerie | null): boolean => this.jourFerieService.compareJourFerie(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ matriceJourFerie }) => {
      this.matriceJourFerie = matriceJourFerie;
      if (matriceJourFerie) {
        this.updateForm(matriceJourFerie);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const matriceJourFerie = this.matriceJourFerieFormService.getMatriceJourFerie(this.editForm);
    if (matriceJourFerie.id !== null) {
      this.subscribeToSaveResponse(this.matriceJourFerieService.update(matriceJourFerie));
    } else {
      this.subscribeToSaveResponse(this.matriceJourFerieService.create(matriceJourFerie));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMatriceJourFerie>>): void {
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

  protected updateForm(matriceJourFerie: IMatriceJourFerie): void {
    this.matriceJourFerie = matriceJourFerie;
    this.matriceJourFerieFormService.resetForm(this.editForm, matriceJourFerie);

    this.matriceFacturationsSharedCollection =
      this.matriceFacturationService.addMatriceFacturationToCollectionIfMissing<IMatriceFacturation>(
        this.matriceFacturationsSharedCollection,
        matriceJourFerie.matrice
      );
    this.jourFeriesSharedCollection = this.jourFerieService.addJourFerieToCollectionIfMissing<IJourFerie>(
      this.jourFeriesSharedCollection,
      matriceJourFerie.jourFerie
    );
  }

  protected loadRelationshipsOptions(): void {
    this.matriceFacturationService
      .query()
      .pipe(map((res: HttpResponse<IMatriceFacturation[]>) => res.body ?? []))
      .pipe(
        map((matriceFacturations: IMatriceFacturation[]) =>
          this.matriceFacturationService.addMatriceFacturationToCollectionIfMissing<IMatriceFacturation>(
            matriceFacturations,
            this.matriceJourFerie?.matrice
          )
        )
      )
      .subscribe((matriceFacturations: IMatriceFacturation[]) => (this.matriceFacturationsSharedCollection = matriceFacturations));

    this.jourFerieService
      .query()
      .pipe(map((res: HttpResponse<IJourFerie[]>) => res.body ?? []))
      .pipe(
        map((jourFeries: IJourFerie[]) =>
          this.jourFerieService.addJourFerieToCollectionIfMissing<IJourFerie>(jourFeries, this.matriceJourFerie?.jourFerie)
        )
      )
      .subscribe((jourFeries: IJourFerie[]) => (this.jourFeriesSharedCollection = jourFeries));
  }
}
