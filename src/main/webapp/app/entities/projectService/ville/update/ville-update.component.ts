import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IVille, NewVille } from '../ville.model';
import { VilleService } from '../service/ville.service';
import { IZone } from '../../zone/zone.model';
import { ZoneService } from '../../zone/service/zone.service';

@Component({
  selector: 'jhi-ville-update',
  templateUrl: './ville-update.component.html',
})
export class VilleUpdateComponent implements OnInit {
  isSaving = false;
  ville: IVille | null = null;

  zonesSharedCollection: IZone[] = [];

  editForm = this.fb.group({
    id: [null as number | null],
    nom: [null as string | null, [Validators.required]],
    zoneId: [null as number | null, [Validators.required]],
  });

  constructor(
    protected villeService: VilleService,
    protected zoneService: ZoneService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ ville }) => {
      this.ville = ville;
      if (ville) {
        this.updateForm(ville);
      }
      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const ville = this.createFromForm();
    if (ville.id !== null) {
      this.subscribeToSaveResponse(this.villeService.update(ville as IVille));
    } else {
      this.subscribeToSaveResponse(this.villeService.create(ville as NewVille));
    }
  }

  protected loadRelationshipsOptions(): void {
    this.zoneService
      .query()
      .pipe(map((res: HttpResponse<IZone[]>) => res.body ?? []))
      .subscribe((zones: IZone[]) => (this.zonesSharedCollection = zones));
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IVille>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Show an error message here if you want
  }

  protected createFromForm(): IVille | NewVille {
    return { ...this.editForm.getRawValue() } as IVille | NewVille;
  }

  protected updateForm(ville: IVille): void {
    this.ville = ville;
    this.editForm.patchValue({
      id: ville.id,
      nom: ville.nom,
      zoneId: ville.zoneId,
    });
  }
}
