import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AgenceComponent } from './list/agence.component';
import { AgenceDetailComponent } from './detail/agence-detail.component';
import { AgenceUpdateComponent } from './update/agence-update.component';
import { AgenceDeleteDialogComponent } from './delete/agence-delete-dialog.component';
import { AgenceRoutingModule } from './route/agence-routing.module';

@NgModule({
  imports: [SharedModule, AgenceRoutingModule],
  declarations: [AgenceComponent, AgenceDetailComponent, AgenceUpdateComponent, AgenceDeleteDialogComponent],
})
export class ProjectServiceAgenceModule {}
