import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { DetailRessourceComponent } from './list/detail-ressource.component';
import { DetailRessourceDetailComponent } from './detail/detail-ressource-detail.component';
import { DetailRessourceUpdateComponent } from './update/detail-ressource-update.component';
import { DetailRessourceDeleteDialogComponent } from './delete/detail-ressource-delete-dialog.component';
import { DetailRessourceRoutingModule } from './route/detail-ressource-routing.module';

@NgModule({
  imports: [SharedModule, DetailRessourceRoutingModule],
  declarations: [
    DetailRessourceComponent,
    DetailRessourceDetailComponent,
    DetailRessourceUpdateComponent,
    DetailRessourceDeleteDialogComponent,
  ],
})
export class ProjectServiceDetailRessourceModule {}
