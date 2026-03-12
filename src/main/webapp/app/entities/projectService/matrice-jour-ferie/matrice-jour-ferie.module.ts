import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { MatriceJourFerieComponent } from './list/matrice-jour-ferie.component';
import { MatriceJourFerieDetailComponent } from './detail/matrice-jour-ferie-detail.component';
import { MatriceJourFerieUpdateComponent } from './update/matrice-jour-ferie-update.component';
import { MatriceJourFerieDeleteDialogComponent } from './delete/matrice-jour-ferie-delete-dialog.component';
import { MatriceJourFerieRoutingModule } from './route/matrice-jour-ferie-routing.module';

@NgModule({
  imports: [SharedModule, MatriceJourFerieRoutingModule],
  declarations: [
    MatriceJourFerieComponent,
    MatriceJourFerieDetailComponent,
    MatriceJourFerieUpdateComponent,
    MatriceJourFerieDeleteDialogComponent,
  ],
})
export class ProjectServiceMatriceJourFerieModule {}
