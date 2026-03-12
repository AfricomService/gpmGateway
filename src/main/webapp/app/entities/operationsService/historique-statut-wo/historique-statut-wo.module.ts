import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { HistoriqueStatutWOComponent } from './list/historique-statut-wo.component';
import { HistoriqueStatutWODetailComponent } from './detail/historique-statut-wo-detail.component';
import { HistoriqueStatutWOUpdateComponent } from './update/historique-statut-wo-update.component';
import { HistoriqueStatutWODeleteDialogComponent } from './delete/historique-statut-wo-delete-dialog.component';
import { HistoriqueStatutWORoutingModule } from './route/historique-statut-wo-routing.module';

@NgModule({
  imports: [SharedModule, HistoriqueStatutWORoutingModule],
  declarations: [
    HistoriqueStatutWOComponent,
    HistoriqueStatutWODetailComponent,
    HistoriqueStatutWOUpdateComponent,
    HistoriqueStatutWODeleteDialogComponent,
  ],
})
export class OperationsServiceHistoriqueStatutWOModule {}
