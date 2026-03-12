import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ZoneFormService, ZoneFormGroup } from './zone-form.service';
import { IZone } from '../zone.model';
import { ZoneService } from '../service/zone.service';
import { IVille } from 'app/entities/projectService/ville/ville.model';
import { VilleService } from 'app/entities/projectService/ville/service/ville.service';

@Component({
  selector: 'jhi-zone-update',
  templateUrl: './zone-update.component.html',
})
export class ZoneUpdateComponent implements OnInit {
  isSaving = false;
  zone: IZone | null = null;

  villesSharedCollection: IVille[] = [];

  editForm: ZoneFormGroup = this.zoneFormService.createZoneFormGroup();

  constructor(
    protected zoneService: ZoneService,
    protected zoneFormService: ZoneFormService,
    protected villeService: VilleService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareVille = (o1: IVille | null, o2: IVille | null): boolean => this.villeService.compareVille(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ zone }) => {
      this.zone = zone;
      if (zone) {
        this.updateForm(zone);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const zone = this.zoneFormService.getZone(this.editForm);
    if (zone.id !== null) {
      this.subscribeToSaveResponse(this.zoneService.update(zone));
    } else {
      this.subscribeToSaveResponse(this.zoneService.create(zone));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IZone>>): void {
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

  protected updateForm(zone: IZone): void {
    this.zone = zone;
    this.zoneFormService.resetForm(this.editForm, zone);

    this.villesSharedCollection = this.villeService.addVilleToCollectionIfMissing<IVille>(this.villesSharedCollection, zone.ville);
  }

  protected loadRelationshipsOptions(): void {
    this.villeService
      .query()
      .pipe(map((res: HttpResponse<IVille[]>) => res.body ?? []))
      .pipe(map((villes: IVille[]) => this.villeService.addVilleToCollectionIfMissing<IVille>(villes, this.zone?.ville)))
      .subscribe((villes: IVille[]) => (this.villesSharedCollection = villes));
  }
}
