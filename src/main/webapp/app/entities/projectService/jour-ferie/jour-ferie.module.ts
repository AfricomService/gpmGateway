import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { JourFerieComponent } from './list/jour-ferie.component';
import { JourFerieDetailComponent } from './detail/jour-ferie-detail.component';
import { JourFerieUpdateComponent } from './update/jour-ferie-update.component';
import { JourFerieDeleteDialogComponent } from './delete/jour-ferie-delete-dialog.component';
import { JourFerieRoutingModule } from './route/jour-ferie-routing.module';

@NgModule({
  imports: [SharedModule, JourFerieRoutingModule],
  declarations: [JourFerieComponent, JourFerieDetailComponent, JourFerieUpdateComponent, JourFerieDeleteDialogComponent],
})
export class ProjectServiceJourFerieModule {}
