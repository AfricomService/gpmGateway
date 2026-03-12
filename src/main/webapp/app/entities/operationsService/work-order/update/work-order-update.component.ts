import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { WorkOrderFormService, WorkOrderFormGroup } from './work-order-form.service';
import { IWorkOrder } from '../work-order.model';
import { WorkOrderService } from '../service/work-order.service';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

@Component({
  selector: 'jhi-work-order-update',
  templateUrl: './work-order-update.component.html',
})
export class WorkOrderUpdateComponent implements OnInit {
  isSaving = false;
  workOrder: IWorkOrder | null = null;
  statutWOValues = Object.keys(StatutWO);

  editForm: WorkOrderFormGroup = this.workOrderFormService.createWorkOrderFormGroup();

  constructor(
    protected workOrderService: WorkOrderService,
    protected workOrderFormService: WorkOrderFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ workOrder }) => {
      this.workOrder = workOrder;
      if (workOrder) {
        this.updateForm(workOrder);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const workOrder = this.workOrderFormService.getWorkOrder(this.editForm);
    if (workOrder.id !== null) {
      this.subscribeToSaveResponse(this.workOrderService.update(workOrder));
    } else {
      this.subscribeToSaveResponse(this.workOrderService.create(workOrder));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IWorkOrder>>): void {
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

  protected updateForm(workOrder: IWorkOrder): void {
    this.workOrder = workOrder;
    this.workOrderFormService.resetForm(this.editForm, workOrder);
  }
}
