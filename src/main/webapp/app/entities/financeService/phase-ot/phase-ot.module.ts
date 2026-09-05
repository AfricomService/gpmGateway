import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PhaseOtComponent } from './list/phase-ot.component';
import { PhaseOtDetailComponent } from './detail/phase-ot-detail.component';
import { PhaseOtUpdateComponent } from './update/phase-ot-update.component';
import { PhaseOtDeleteDialogComponent } from './delete/phase-ot-delete-dialog.component';
import { PhaseOtRoutingModule } from './route/phase-ot-routing.module';

@NgModule({
  imports: [SharedModule, PhaseOtRoutingModule],
  declarations: [PhaseOtComponent, PhaseOtDetailComponent, PhaseOtUpdateComponent, PhaseOtDeleteDialogComponent],
})
export class FinanceServicePhaseOtModule {}
