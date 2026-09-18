import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'app/shared/shared.module';
import { WorkOrderComponent } from './list/work-order.component';
import { WorkOrderDetailComponent } from './detail/work-order-detail.component';
import { WorkOrderUpdateComponent } from './update/work-order-update.component';
import { WorkOrderDeleteDialogComponent } from './delete/work-order-delete-dialog.component';
import { WorkOrderRoutingModule } from './route/work-order-routing.module';
import { ProjectServicePieceJointeModule } from 'app/entities/projectService/piece-jointe/piece-jointe.module';
import { VehiculeSelectorModalComponent } from './vehicule-selector-modal/vehicule-selector-modal.component';
import { RessourceSelectorModalComponent } from './ressource-selector-modal/ressource-selector-modal.component';

@NgModule({
  imports: [SharedModule, FormsModule, NgSelectModule, WorkOrderRoutingModule, ProjectServicePieceJointeModule],
  declarations: [
    WorkOrderComponent,
    WorkOrderDetailComponent,
    WorkOrderUpdateComponent,
    WorkOrderDeleteDialogComponent,
    VehiculeSelectorModalComponent,
    RessourceSelectorModalComponent,
  ],
})
export class OperationsServiceWorkOrderModule {}
