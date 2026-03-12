import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ArticleMissionFormService, ArticleMissionFormGroup } from './article-mission-form.service';
import { IArticleMission } from '../article-mission.model';
import { ArticleMissionService } from '../service/article-mission.service';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

@Component({
  selector: 'jhi-article-mission-update',
  templateUrl: './article-mission-update.component.html',
})
export class ArticleMissionUpdateComponent implements OnInit {
  isSaving = false;
  articleMission: IArticleMission | null = null;

  workOrdersSharedCollection: IWorkOrder[] = [];

  editForm: ArticleMissionFormGroup = this.articleMissionFormService.createArticleMissionFormGroup();

  constructor(
    protected articleMissionService: ArticleMissionService,
    protected articleMissionFormService: ArticleMissionFormService,
    protected workOrderService: WorkOrderService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareWorkOrder = (o1: IWorkOrder | null, o2: IWorkOrder | null): boolean => this.workOrderService.compareWorkOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ articleMission }) => {
      this.articleMission = articleMission;
      if (articleMission) {
        this.updateForm(articleMission);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const articleMission = this.articleMissionFormService.getArticleMission(this.editForm);
    if (articleMission.id !== null) {
      this.subscribeToSaveResponse(this.articleMissionService.update(articleMission));
    } else {
      this.subscribeToSaveResponse(this.articleMissionService.create(articleMission));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IArticleMission>>): void {
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

  protected updateForm(articleMission: IArticleMission): void {
    this.articleMission = articleMission;
    this.articleMissionFormService.resetForm(this.editForm, articleMission);

    this.workOrdersSharedCollection = this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(
      this.workOrdersSharedCollection,
      articleMission.workOrder
    );
  }

  protected loadRelationshipsOptions(): void {
    this.workOrderService
      .query()
      .pipe(map((res: HttpResponse<IWorkOrder[]>) => res.body ?? []))
      .pipe(
        map((workOrders: IWorkOrder[]) =>
          this.workOrderService.addWorkOrderToCollectionIfMissing<IWorkOrder>(workOrders, this.articleMission?.workOrder)
        )
      )
      .subscribe((workOrders: IWorkOrder[]) => (this.workOrdersSharedCollection = workOrders));
  }
}
