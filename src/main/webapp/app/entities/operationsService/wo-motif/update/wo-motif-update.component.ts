import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { WoMotifFormService, WoMotifFormGroup } from './wo-motif-form.service';
import { IWoMotif } from '../wo-motif.model';
import { WoMotifService } from '../service/wo-motif.service';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';
import { IMotif } from 'app/entities/operationsService/motif/motif.model';
import { MotifService } from 'app/entities/operationsService/motif/service/motif.service';

@Component({
  selector: 'jhi-wo-motif-update',
  templateUrl: './wo-motif-update.component.html',
})
export class WoMotifUpdateComponent implements OnInit {
  isSaving = false;
  woMotif: IWoMotif | null = null;

  workOrdersSharedCollection: IWorkOrder[] = [];
  motifsSharedCollection: IMotif[] = [];

  editForm: WoMotifFormGroup = this.woMotifFormService.createWoMotifFormGroup();

  constructor(
    protected woMotifService: WoMotifService,
    protected woMotifFormService: WoMotifFormService,
    protected workOrderService: WorkOrderService,
    protected motifService: MotifService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWorkOrder = (o1: IWorkOrder | null, o2: IWorkOrder | null): boolean => this.workOrderService.compareWorkOrder(o1, o2);

  compareMotif = (o1: IMotif | null, o2: IMotif | null): boolean => this.motifService.compareMotif(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ woMotif }) => {
      this.woMotif = woMotif;
      if (woMotif) {
        this.updateForm(woMotif);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const woMotif = this.woMotifFormService.getWoMotif(this.editForm);
    if (woMotif.id !== null) {
      this.subscribeToSaveResponse(this.woMotifService.update(woMotif));
    } else {
      this.subscribeToSaveResponse(this.woMotifService.create(woMotif));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IWoMotif>>): void {
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

  protected updateForm(woMotif: IWoMotif): void {
    this.woMotif = woMotif;
    this.woMotifFormService.resetForm(this.editForm, woMotif);

    this.workOrdersSharedCollection = this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(
      this.workOrdersSharedCollection,
      woMotif.workOrder
    );
    this.motifsSharedCollection = this.motifService.addMotifToCollectionIfMissing<IMotif>(this.motifsSharedCollection, woMotif.motif);
  }

  protected loadRelationshipsOptions(): void {
    this.workOrderService
      .query()
      .pipe(map((res: HttpResponse<IWorkOrder[]>) => res.body ?? []))
      .pipe(
        map((workOrders: IWorkOrder[]) =>
          this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(workOrders, this.woMotif?.workOrder)
        )
      )
      .subscribe((workOrders: IWorkOrder[]) => (this.workOrdersSharedCollection = workOrders));

    this.motifService
      .query()
      .pipe(map((res: HttpResponse<IMotif[]>) => res.body ?? []))
      .pipe(map((motifs: IMotif[]) => this.motifService.addMotifToCollectionIfMissing<IMotif>(motifs, this.woMotif?.motif)))
      .subscribe((motifs: IMotif[]) => (this.motifsSharedCollection = motifs));
  }
}
