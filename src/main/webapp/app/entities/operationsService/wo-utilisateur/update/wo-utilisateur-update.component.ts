import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { WoUtilisateurFormService, WoUtilisateurFormGroup } from './wo-utilisateur-form.service';
import { IWoUtilisateur } from '../wo-utilisateur.model';
import { WoUtilisateurService } from '../service/wo-utilisateur.service';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

@Component({
  selector: 'jhi-wo-utilisateur-update',
  templateUrl: './wo-utilisateur-update.component.html',
})
export class WoUtilisateurUpdateComponent implements OnInit {
  isSaving = false;
  woUtilisateur: IWoUtilisateur | null = null;

  workOrdersSharedCollection: IWorkOrder[] = [];

  editForm: WoUtilisateurFormGroup = this.woUtilisateurFormService.createWoUtilisateurFormGroup();

  constructor(
    protected woUtilisateurService: WoUtilisateurService,
    protected woUtilisateurFormService: WoUtilisateurFormService,
    protected workOrderService: WorkOrderService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWorkOrder = (o1: IWorkOrder | null, o2: IWorkOrder | null): boolean => this.workOrderService.compareWorkOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ woUtilisateur }) => {
      this.woUtilisateur = woUtilisateur;
      if (woUtilisateur) {
        this.updateForm(woUtilisateur);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const woUtilisateur = this.woUtilisateurFormService.getWoUtilisateur(this.editForm);
    if (woUtilisateur.id !== null) {
      this.subscribeToSaveResponse(this.woUtilisateurService.update(woUtilisateur));
    } else {
      this.subscribeToSaveResponse(this.woUtilisateurService.create(woUtilisateur));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IWoUtilisateur>>): void {
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

  protected updateForm(woUtilisateur: IWoUtilisateur): void {
    this.woUtilisateur = woUtilisateur;
    this.woUtilisateurFormService.resetForm(this.editForm, woUtilisateur);

    this.workOrdersSharedCollection = this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(
      this.workOrdersSharedCollection,
      woUtilisateur.workOrder
    );
  }

  protected loadRelationshipsOptions(): void {
    this.workOrderService
      .query()
      .pipe(map((res: HttpResponse<IWorkOrder[]>) => res.body ?? []))
      .pipe(
        map((workOrders: IWorkOrder[]) =>
          this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(workOrders, this.woUtilisateur?.workOrder)
        )
      )
      .subscribe((workOrders: IWorkOrder[]) => (this.workOrdersSharedCollection = workOrders));
  }
}
