import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { SSTFormService, SSTFormGroup } from './sst-form.service';
import { ISST } from '../sst.model';
import { SSTService } from '../service/sst.service';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

@Component({
  selector: 'jhi-sst-update',
  templateUrl: './sst-update.component.html',
})
export class SSTUpdateComponent implements OnInit {
  isSaving = false;
  sST: ISST | null = null;

  workOrdersSharedCollection: IWorkOrder[] = [];

  editForm: SSTFormGroup = this.sSTFormService.createSSTFormGroup();

  constructor(
    protected sSTService: SSTService,
    protected sSTFormService: SSTFormService,
    protected workOrderService: WorkOrderService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWorkOrder = (o1: IWorkOrder | null, o2: IWorkOrder | null): boolean => this.workOrderService.compareWorkOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ sST }) => {
      this.sST = sST;
      if (sST) {
        this.updateForm(sST);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const sST = this.sSTFormService.getSST(this.editForm);
    if (sST.id !== null) {
      this.subscribeToSaveResponse(this.sSTService.update(sST));
    } else {
      this.subscribeToSaveResponse(this.sSTService.create(sST));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISST>>): void {
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

  protected updateForm(sST: ISST): void {
    this.sST = sST;
    this.sSTFormService.resetForm(this.editForm, sST);

    this.workOrdersSharedCollection = this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(
      this.workOrdersSharedCollection,
      sST.workOrder
    );
  }

  protected loadRelationshipsOptions(): void {
    this.workOrderService
      .query()
      .pipe(map((res: HttpResponse<IWorkOrder[]>) => res.body ?? []))
      .pipe(
        map((workOrders: IWorkOrder[]) =>
          this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(workOrders, this.sST?.workOrder)
        )
      )
      .subscribe((workOrders: IWorkOrder[]) => (this.workOrdersSharedCollection = workOrders));
  }
}
