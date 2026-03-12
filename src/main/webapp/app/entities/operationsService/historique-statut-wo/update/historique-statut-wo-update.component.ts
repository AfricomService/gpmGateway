import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { HistoriqueStatutWOFormService, HistoriqueStatutWOFormGroup } from './historique-statut-wo-form.service';
import { IHistoriqueStatutWO } from '../historique-statut-wo.model';
import { HistoriqueStatutWOService } from '../service/historique-statut-wo.service';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

@Component({
  selector: 'jhi-historique-statut-wo-update',
  templateUrl: './historique-statut-wo-update.component.html',
})
export class HistoriqueStatutWOUpdateComponent implements OnInit {
  isSaving = false;
  historiqueStatutWO: IHistoriqueStatutWO | null = null;
  statutWOValues = Object.keys(StatutWO);

  workOrdersSharedCollection: IWorkOrder[] = [];

  editForm: HistoriqueStatutWOFormGroup = this.historiqueStatutWOFormService.createHistoriqueStatutWOFormGroup();

  constructor(
    protected historiqueStatutWOService: HistoriqueStatutWOService,
    protected historiqueStatutWOFormService: HistoriqueStatutWOFormService,
    protected workOrderService: WorkOrderService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWorkOrder = (o1: IWorkOrder | null, o2: IWorkOrder | null): boolean => this.workOrderService.compareWorkOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ historiqueStatutWO }) => {
      this.historiqueStatutWO = historiqueStatutWO;
      if (historiqueStatutWO) {
        this.updateForm(historiqueStatutWO);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const historiqueStatutWO = this.historiqueStatutWOFormService.getHistoriqueStatutWO(this.editForm);
    if (historiqueStatutWO.id !== null) {
      this.subscribeToSaveResponse(this.historiqueStatutWOService.update(historiqueStatutWO));
    } else {
      this.subscribeToSaveResponse(this.historiqueStatutWOService.create(historiqueStatutWO));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IHistoriqueStatutWO>>): void {
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

  protected updateForm(historiqueStatutWO: IHistoriqueStatutWO): void {
    this.historiqueStatutWO = historiqueStatutWO;
    this.historiqueStatutWOFormService.resetForm(this.editForm, historiqueStatutWO);

    this.workOrdersSharedCollection = this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(
      this.workOrdersSharedCollection,
      historiqueStatutWO.workOrder
    );
  }

  protected loadRelationshipsOptions(): void {
    this.workOrderService
      .query()
      .pipe(map((res: HttpResponse<IWorkOrder[]>) => res.body ?? []))
      .pipe(
        map((workOrders: IWorkOrder[]) =>
          this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(workOrders, this.historiqueStatutWO?.workOrder)
        )
      )
      .subscribe((workOrders: IWorkOrder[]) => (this.workOrdersSharedCollection = workOrders));
  }
}
