import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { DemandeEspeceComponent } from './list/demande-espece.component';
import { DemandeEspeceDetailComponent } from './detail/demande-espece-detail.component';
import { DemandeEspeceUpdateComponent } from './update/demande-espece-update.component';
import { DemandeEspeceDeleteDialogComponent } from './delete/demande-espece-delete-dialog.component';
import { DemandeEspeceRoutingModule } from './route/demande-espece-routing.module';

@NgModule({
  imports: [SharedModule, DemandeEspeceRoutingModule],
  declarations: [DemandeEspeceComponent, DemandeEspeceDetailComponent, DemandeEspeceUpdateComponent, DemandeEspeceDeleteDialogComponent],
})
export class FinanceServiceDemandeEspeceModule {}
