import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'app/shared/shared.module';
import { WorkOrderComponent } from './list/work-order.component';
import { WorkOrderDetailComponent } from './detail/work-order-detail.component';
import { WorkOrderUpdateComponent } from './update/work-order-update.component';
import { WorkOrderDeleteDialogComponent } from './delete/work-order-delete-dialog.component';
import { WorkOrderRoutingModule } from './route/work-order-routing.module';

@NgModule({
  imports: [SharedModule, FormsModule, NgSelectModule, WorkOrderRoutingModule],
  declarations: [WorkOrderComponent, WorkOrderDetailComponent, WorkOrderUpdateComponent, WorkOrderDeleteDialogComponent],
})
export class OperationsServiceWorkOrderModule {}
