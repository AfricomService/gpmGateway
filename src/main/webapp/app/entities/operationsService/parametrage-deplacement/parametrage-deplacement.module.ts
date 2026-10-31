import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ParametrageDeplacementComponent } from './list/parametrage-deplacement.component';
import { ParametrageDeplacementDetailComponent } from './detail/parametrage-deplacement-detail.component';
import { ParametrageDeplacementUpdateComponent } from './update/parametrage-deplacement-update.component';
import { ParametrageDeplacementDeleteDialogComponent } from './delete/parametrage-deplacement-delete-dialog.component';
import { ParametrageDeplacementRoutingModule } from './route/parametrage-deplacement-routing.module';

@NgModule({
  imports: [SharedModule, ParametrageDeplacementRoutingModule],
  declarations: [
    ParametrageDeplacementComponent,
    ParametrageDeplacementDetailComponent,
    ParametrageDeplacementUpdateComponent,
    ParametrageDeplacementDeleteDialogComponent,
  ],
})
export class OperationsServiceParametrageDeplacementModule {}
