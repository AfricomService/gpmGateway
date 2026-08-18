import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { RessourceComponent } from './list/ressource.component';
import { RessourceDetailComponent } from './detail/ressource-detail.component';
import { RessourceUpdateComponent } from './update/ressource-update.component';
import { RessourceDeleteDialogComponent } from './delete/ressource-delete-dialog.component';
import { RessourceRoutingModule } from './route/ressource-routing.module';

@NgModule({
  imports: [SharedModule, RessourceRoutingModule],
  declarations: [RessourceComponent, RessourceDetailComponent, RessourceUpdateComponent, RessourceDeleteDialogComponent],
})
export class ProjectServiceRessourceModule {}
