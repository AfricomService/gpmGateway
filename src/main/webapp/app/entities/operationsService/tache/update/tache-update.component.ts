import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { TacheFormService, TacheFormGroup } from './tache-form.service';
import { ITache } from '../tache.model';
import { TacheService } from '../service/tache.service';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';
import { IActivite } from 'app/entities/operationsService/activite/activite.model';
import { ActiviteService } from 'app/entities/operationsService/activite/service/activite.service';

@Component({
  selector: 'jhi-tache-update',
  templateUrl: './tache-update.component.html',
})
export class TacheUpdateComponent implements OnInit {
  isSaving = false;
  tache: ITache | null = null;

  workOrdersSharedCollection: IWorkOrder[] = [];
  activitesSharedCollection: IActivite[] = [];

  editForm: TacheFormGroup = this.tacheFormService.createTacheFormGroup();

  constructor(
    protected tacheService: TacheService,
    protected tacheFormService: TacheFormService,
    protected workOrderService: WorkOrderService,
    protected activiteService: ActiviteService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWorkOrder = (o1: IWorkOrder | null, o2: IWorkOrder | null): boolean => this.workOrderService.compareWorkOrder(o1, o2);

  compareActivite = (o1: IActivite | null, o2: IActivite | null): boolean => this.activiteService.compareActivite(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tache }) => {
      this.tache = tache;
      if (tache) {
        this.updateForm(tache);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const tache = this.tacheFormService.getTache(this.editForm);
    if (tache.id !== null) {
      this.subscribeToSaveResponse(this.tacheService.update(tache));
    } else {
      this.subscribeToSaveResponse(this.tacheService.create(tache));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITache>>): void {
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

  protected updateForm(tache: ITache): void {
    this.tache = tache;
    this.tacheFormService.resetForm(this.editForm, tache);

    this.workOrdersSharedCollection = this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(
      this.workOrdersSharedCollection,
      tache.workOrder
    );
    this.activitesSharedCollection = this.activiteService.addActiviteToCollectionIfMissing<IActivite>(
      this.activitesSharedCollection,
      tache.activite
    );
  }

  protected loadRelationshipsOptions(): void {
    this.workOrderService
      .query()
      .pipe(map((res: HttpResponse<IWorkOrder[]>) => res.body ?? []))
      .pipe(
        map((workOrders: IWorkOrder[]) =>
          this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(workOrders, this.tache?.workOrder)
        )
      )
      .subscribe((workOrders: IWorkOrder[]) => (this.workOrdersSharedCollection = workOrders));

    this.activiteService
      .query()
      .pipe(map((res: HttpResponse<IActivite[]>) => res.body ?? []))
      .pipe(
        map((activites: IActivite[]) => this.activiteService.addActiviteToCollectionIfMissing<IActivite>(activites, this.tache?.activite))
      )
      .subscribe((activites: IActivite[]) => (this.activitesSharedCollection = activites));
  }
}
