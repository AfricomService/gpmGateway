import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { BonCommandeComponent } from './list/bon-commande.component';
import { BonCommandeDetailComponent } from './detail/bon-commande-detail.component';
import { BonCommandeUpdateComponent } from './update/bon-commande-update.component';
import { BonCommandeDeleteDialogComponent } from './delete/bon-commande-delete-dialog.component';
import { BonCommandeRoutingModule } from './route/bon-commande-routing.module';
import { AffaireSelectorModalComponent } from './affaire-selector-modal/affaire-selector-modal.component';
import { ContactSelectorModalComponent } from './contact-selector-modal/contact-selector-modal.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SiteSelectorModalComponent } from './site-selector-modal/site-selector-modal.component';

@NgModule({
  imports: [SharedModule, BonCommandeRoutingModule, FormsModule, NgSelectModule],
  declarations: [
    BonCommandeComponent,
    BonCommandeDetailComponent,
    BonCommandeUpdateComponent,
    BonCommandeDeleteDialogComponent,
    AffaireSelectorModalComponent,
    ContactSelectorModalComponent,
    SiteSelectorModalComponent,
  ],
})
export class FinanceServiceBonCommandeModule {}
