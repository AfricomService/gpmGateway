import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { MatriceFacturationComponent } from './list/matrice-facturation.component';
import { MatriceFacturationDetailComponent } from './detail/matrice-facturation-detail.component';
import { MatriceFacturationUpdateComponent } from './update/matrice-facturation-update.component';
import { MatriceFacturationDeleteDialogComponent } from './delete/matrice-facturation-delete-dialog.component';
import { MatriceFacturationRoutingModule } from './route/matrice-facturation-routing.module';

@NgModule({
  imports: [SharedModule, MatriceFacturationRoutingModule],
  declarations: [
    MatriceFacturationComponent,
    MatriceFacturationDetailComponent,
    MatriceFacturationUpdateComponent,
    MatriceFacturationDeleteDialogComponent,
  ],
})
export class ProjectServiceMatriceFacturationModule {}
