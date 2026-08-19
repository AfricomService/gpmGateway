import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DetailRessourceFormService, DetailRessourceFormGroup } from './detail-ressource-form.service';
import { IDetailRessource } from '../detail-ressource.model';
import { DetailRessourceService } from '../service/detail-ressource.service';

@Component({
  selector: 'jhi-detail-ressource-update',
  templateUrl: './detail-ressource-update.component.html',
})
export class DetailRessourceUpdateComponent implements OnInit {
  isSaving = false;
  detailRessource: IDetailRessource | null = null;

  editForm: DetailRessourceFormGroup = this.detailRessourceFormService.createDetailRessourceFormGroup();

  constructor(
    protected detailRessourceService: DetailRessourceService,
    protected detailRessourceFormService: DetailRessourceFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ detailRessource }) => {
      this.detailRessource = detailRessource;
      if (detailRessource) {
        this.updateForm(detailRessource);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const detailRessource = this.detailRessourceFormService.getDetailRessource(this.editForm);
    if (detailRessource.id !== null) {
      this.subscribeToSaveResponse(this.detailRessourceService.update(detailRessource));
    } else {
      this.subscribeToSaveResponse(this.detailRessourceService.create(detailRessource));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDetailRessource>>): void {
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

  protected updateForm(detailRessource: IDetailRessource): void {
    this.detailRessource = detailRessource;
    this.detailRessourceFormService.resetForm(this.editForm, detailRessource);
  }
}
