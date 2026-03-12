import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { MatriceFacturationFormService, MatriceFacturationFormGroup } from './matrice-facturation-form.service';
import { IMatriceFacturation } from '../matrice-facturation.model';
import { MatriceFacturationService } from '../service/matrice-facturation.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IVille } from 'app/entities/projectService/ville/ville.model';
import { VilleService } from 'app/entities/projectService/ville/service/ville.service';
import { IZone } from 'app/entities/projectService/zone/zone.model';
import { ZoneService } from 'app/entities/projectService/zone/service/zone.service';

@Component({
  selector: 'jhi-matrice-facturation-update',
  templateUrl: './matrice-facturation-update.component.html',
})
export class MatriceFacturationUpdateComponent implements OnInit {
  isSaving = false;
  matriceFacturation: IMatriceFacturation | null = null;

  affairesSharedCollection: IAffaire[] = [];
  villesSharedCollection: IVille[] = [];
  zonesSharedCollection: IZone[] = [];

  editForm: MatriceFacturationFormGroup = this.matriceFacturationFormService.createMatriceFacturationFormGroup();

  constructor(
    protected matriceFacturationService: MatriceFacturationService,
    protected matriceFacturationFormService: MatriceFacturationFormService,
    protected affaireService: AffaireService,
    protected villeService: VilleService,
    protected zoneService: ZoneService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareAffaire = (o1: IAffaire | null, o2: IAffaire | null): boolean => this.affaireService.compareAffaire(o1, o2);

  compareVille = (o1: IVille | null, o2: IVille | null): boolean => this.villeService.compareVille(o1, o2);

  compareZone = (o1: IZone | null, o2: IZone | null): boolean => this.zoneService.compareZone(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ matriceFacturation }) => {
      this.matriceFacturation = matriceFacturation;
      if (matriceFacturation) {
        this.updateForm(matriceFacturation);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const matriceFacturation = this.matriceFacturationFormService.getMatriceFacturation(this.editForm);
    if (matriceFacturation.id !== null) {
      this.subscribeToSaveResponse(this.matriceFacturationService.update(matriceFacturation));
    } else {
      this.subscribeToSaveResponse(this.matriceFacturationService.create(matriceFacturation));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMatriceFacturation>>): void {
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

  protected updateForm(matriceFacturation: IMatriceFacturation): void {
    this.matriceFacturation = matriceFacturation;
    this.matriceFacturationFormService.resetForm(this.editForm, matriceFacturation);

    this.affairesSharedCollection = this.affaireService.addAffaireToCollectionIfMissing<IAffaire>(
      this.affairesSharedCollection,
      matriceFacturation.affaire
    );
    this.villesSharedCollection = this.villeService.addVilleToCollectionIfMissing<IVille>(
      this.villesSharedCollection,
      matriceFacturation.ville
    );
    this.zonesSharedCollection = this.zoneService.addZoneToCollectionIfMissing<IZone>(this.zonesSharedCollection, matriceFacturation.zone);
  }

  protected loadRelationshipsOptions(): void {
    this.affaireService
      .query()
      .pipe(map((res: HttpResponse<IAffaire[]>) => res.body ?? []))
      .pipe(
        map((affaires: IAffaire[]) =>
          this.affaireService.addAffaireToCollectionIfMissing<IAffaire>(affaires, this.matriceFacturation?.affaire)
        )
      )
      .subscribe((affaires: IAffaire[]) => (this.affairesSharedCollection = affaires));

    this.villeService
      .query()
      .pipe(map((res: HttpResponse<IVille[]>) => res.body ?? []))
      .pipe(map((villes: IVille[]) => this.villeService.addVilleToCollectionIfMissing<IVille>(villes, this.matriceFacturation?.ville)))
      .subscribe((villes: IVille[]) => (this.villesSharedCollection = villes));

    this.zoneService
      .query()
      .pipe(map((res: HttpResponse<IZone[]>) => res.body ?? []))
      .pipe(map((zones: IZone[]) => this.zoneService.addZoneToCollectionIfMissing<IZone>(zones, this.matriceFacturation?.zone)))
      .subscribe((zones: IZone[]) => (this.zonesSharedCollection = zones));
  }
}
