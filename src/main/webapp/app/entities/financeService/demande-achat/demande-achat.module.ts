import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { DemandeAchatComponent } from './list/demande-achat.component';
import { DemandeAchatDetailComponent } from './detail/demande-achat-detail.component';
import { DemandeAchatUpdateComponent } from './update/demande-achat-update.component';
import { DemandeAchatDeleteDialogComponent } from './delete/demande-achat-delete-dialog.component';
import { DemandeAchatRoutingModule } from './route/demande-achat-routing.module';

@NgModule({
  imports: [SharedModule, DemandeAchatRoutingModule],
  declarations: [DemandeAchatComponent, DemandeAchatDetailComponent, DemandeAchatUpdateComponent, DemandeAchatDeleteDialogComponent],
})
export class FinanceServiceDemandeAchatModule {}
