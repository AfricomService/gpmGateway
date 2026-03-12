import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { FactureWOComponent } from './list/facture-wo.component';
import { FactureWODetailComponent } from './detail/facture-wo-detail.component';
import { FactureWOUpdateComponent } from './update/facture-wo-update.component';
import { FactureWODeleteDialogComponent } from './delete/facture-wo-delete-dialog.component';
import { FactureWORoutingModule } from './route/facture-wo-routing.module';

@NgModule({
  imports: [SharedModule, FactureWORoutingModule],
  declarations: [FactureWOComponent, FactureWODetailComponent, FactureWOUpdateComponent, FactureWODeleteDialogComponent],
})
export class FinanceServiceFactureWOModule {}
