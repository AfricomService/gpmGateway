import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { FraisDeMissionComponent } from './list/frais-de-mission.component';
import { FraisDeMissionDetailComponent } from './detail/frais-de-mission-detail.component';
import { FraisDeMissionUpdateComponent } from './update/frais-de-mission-update.component';
import { FraisDeMissionDeleteDialogComponent } from './delete/frais-de-mission-delete-dialog.component';
import { FraisDeMissionRoutingModule } from './route/frais-de-mission-routing.module';

@NgModule({
  imports: [SharedModule, FraisDeMissionRoutingModule],
  declarations: [
    FraisDeMissionComponent,
    FraisDeMissionDetailComponent,
    FraisDeMissionUpdateComponent,
    FraisDeMissionDeleteDialogComponent,
  ],
})
export class FinanceServiceFraisDeMissionModule {}
