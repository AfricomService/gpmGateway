import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { TypeRessourceComponent } from './list/type-ressource.component';
import { TypeRessourceDetailComponent } from './detail/type-ressource-detail.component';
import { TypeRessourceUpdateComponent } from './update/type-ressource-update.component';
import { TypeRessourceDeleteDialogComponent } from './delete/type-ressource-delete-dialog.component';
import { TypeRessourceRoutingModule } from './route/type-ressource-routing.module';

@NgModule({
  imports: [SharedModule, TypeRessourceRoutingModule],
  declarations: [TypeRessourceComponent, TypeRessourceDetailComponent, TypeRessourceUpdateComponent, TypeRessourceDeleteDialogComponent],
})
export class ProjectServiceTypeRessourceModule {}
