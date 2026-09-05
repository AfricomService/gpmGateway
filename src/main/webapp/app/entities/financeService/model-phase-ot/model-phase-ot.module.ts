import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ModelPhaseOTComponent } from './list/model-phase-ot.component';
import { ModelPhaseOTDetailComponent } from './detail/model-phase-ot-detail.component';
import { ModelPhaseOTUpdateComponent } from './update/model-phase-ot-update.component';
import { ModelPhaseOTDeleteDialogComponent } from './delete/model-phase-ot-delete-dialog.component';
import { ModelPhaseOTRoutingModule } from './route/model-phase-ot-routing.module';

@NgModule({
  imports: [SharedModule, ModelPhaseOTRoutingModule],
  declarations: [ModelPhaseOTComponent, ModelPhaseOTDetailComponent, ModelPhaseOTUpdateComponent, ModelPhaseOTDeleteDialogComponent],
})
export class FinanceServiceModelPhaseOTModule {}
