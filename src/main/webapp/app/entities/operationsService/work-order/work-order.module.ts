import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { WorkOrderComponent } from './list/work-order.component';
import { WorkOrderDetailComponent } from './detail/work-order-detail.component';
import { WorkOrderUpdateComponent } from './update/work-order-update.component';
import { WorkOrderDeleteDialogComponent } from './delete/work-order-delete-dialog.component';
import { WorkOrderRoutingModule } from './route/work-order-routing.module';

@NgModule({
  imports: [SharedModule, WorkOrderRoutingModule],
  declarations: [WorkOrderComponent, WorkOrderDetailComponent, WorkOrderUpdateComponent, WorkOrderDeleteDialogComponent],
})
export class OperationsServiceWorkOrderModule {}
