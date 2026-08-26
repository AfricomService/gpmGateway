import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { BonCommandeComponent } from './list/bon-commande.component';
import { BonCommandeDetailComponent } from './detail/bon-commande-detail.component';
import { BonCommandeUpdateComponent } from './update/bon-commande-update.component';
import { BonCommandeDeleteDialogComponent } from './delete/bon-commande-delete-dialog.component';
import { BonCommandeRoutingModule } from './route/bon-commande-routing.module';
import { AffaireSelectorModalComponent } from './affaire-selector-modal/affaire-selector-modal.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [SharedModule, BonCommandeRoutingModule, FormsModule],
  declarations: [
    BonCommandeComponent,
    BonCommandeDetailComponent,
    BonCommandeUpdateComponent,
    BonCommandeDeleteDialogComponent,
    AffaireSelectorModalComponent,
  ],
})
export class FinanceServiceBonCommandeModule {}
