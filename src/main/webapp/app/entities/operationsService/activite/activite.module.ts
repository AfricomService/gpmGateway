import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ActiviteComponent } from './list/activite.component';
import { ActiviteDetailComponent } from './detail/activite-detail.component';
import { ActiviteUpdateComponent } from './update/activite-update.component';
import { ActiviteDeleteDialogComponent } from './delete/activite-delete-dialog.component';
import { ActiviteRoutingModule } from './route/activite-routing.module';

@NgModule({
  imports: [SharedModule, ActiviteRoutingModule],
  declarations: [ActiviteComponent, ActiviteDetailComponent, ActiviteUpdateComponent, ActiviteDeleteDialogComponent],
})
export class OperationsServiceActiviteModule {}
