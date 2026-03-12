import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { DevisComponent } from './list/devis.component';
import { DevisDetailComponent } from './detail/devis-detail.component';
import { DevisUpdateComponent } from './update/devis-update.component';
import { DevisDeleteDialogComponent } from './delete/devis-delete-dialog.component';
import { DevisRoutingModule } from './route/devis-routing.module';

@NgModule({
  imports: [SharedModule, DevisRoutingModule],
  declarations: [DevisComponent, DevisDetailComponent, DevisUpdateComponent, DevisDeleteDialogComponent],
})
export class FinanceServiceDevisModule {}
