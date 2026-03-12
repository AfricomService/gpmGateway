import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IWorkOrder } from '../work-order.model';

@Component({
  selector: 'jhi-work-order-detail',
  templateUrl: './work-order-detail.component.html',
})
export class WorkOrderDetailComponent implements OnInit {
  workOrder: IWorkOrder | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ workOrder }) => {
      this.workOrder = workOrder;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
