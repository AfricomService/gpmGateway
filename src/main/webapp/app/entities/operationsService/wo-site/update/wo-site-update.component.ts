import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { WoSiteFormService, WoSiteFormGroup } from './wo-site-form.service';
import { IWoSite } from '../wo-site.model';
import { WoSiteService } from '../service/wo-site.service';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

@Component({
  selector: 'jhi-wo-site-update',
  templateUrl: './wo-site-update.component.html',
})
export class WoSiteUpdateComponent implements OnInit {
  isSaving = false;
  woSite: IWoSite | null = null;

  workOrdersSharedCollection: IWorkOrder[] = [];

  editForm: WoSiteFormGroup = this.woSiteFormService.createWoSiteFormGroup();

  constructor(
    protected woSiteService: WoSiteService,
    protected woSiteFormService: WoSiteFormService,
    protected workOrderService: WorkOrderService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWorkOrder = (o1: IWorkOrder | null, o2: IWorkOrder | null): boolean => this.workOrderService.compareWorkOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ woSite }) => {
      this.woSite = woSite;
      if (woSite) {
        this.updateForm(woSite);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const woSite = this.woSiteFormService.getWoSite(this.editForm);
    if (woSite.id !== null) {
      this.subscribeToSaveResponse(this.woSiteService.update(woSite));
    } else {
      this.subscribeToSaveResponse(this.woSiteService.create(woSite));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IWoSite>>): void {
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

  protected updateForm(woSite: IWoSite): void {
    this.woSite = woSite;
    this.woSiteFormService.resetForm(this.editForm, woSite);

    this.workOrdersSharedCollection = this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(
      this.workOrdersSharedCollection,
      woSite.workOrder
    );
  }

  protected loadRelationshipsOptions(): void {
    this.workOrderService
      .query()
      .pipe(map((res: HttpResponse<IWorkOrder[]>) => res.body ?? []))
      .pipe(
        map((workOrders: IWorkOrder[]) =>
          this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(workOrders, this.woSite?.workOrder)
        )
      )
      .subscribe((workOrders: IWorkOrder[]) => (this.workOrdersSharedCollection = workOrders));
  }
}
