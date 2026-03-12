import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { WorkOrderComponent } from '../list/work-order.component';
import { WorkOrderDetailComponent } from '../detail/work-order-detail.component';
import { WorkOrderUpdateComponent } from '../update/work-order-update.component';
import { WorkOrderRoutingResolveService } from './work-order-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const workOrderRoute: Routes = [
  {
    path: '',
    component: WorkOrderComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: WorkOrderDetailComponent,
    resolve: {
      workOrder: WorkOrderRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: WorkOrderUpdateComponent,
    resolve: {
      workOrder: WorkOrderRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: WorkOrderUpdateComponent,
    resolve: {
      workOrder: WorkOrderRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(workOrderRoute)],
  exports: [RouterModule],
})
export class WorkOrderRoutingModule {}
