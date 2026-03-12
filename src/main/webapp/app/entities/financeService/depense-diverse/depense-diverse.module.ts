import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { DepenseDiverseComponent } from './list/depense-diverse.component';
import { DepenseDiverseDetailComponent } from './detail/depense-diverse-detail.component';
import { DepenseDiverseUpdateComponent } from './update/depense-diverse-update.component';
import { DepenseDiverseDeleteDialogComponent } from './delete/depense-diverse-delete-dialog.component';
import { DepenseDiverseRoutingModule } from './route/depense-diverse-routing.module';

@NgModule({
  imports: [SharedModule, DepenseDiverseRoutingModule],
  declarations: [
    DepenseDiverseComponent,
    DepenseDiverseDetailComponent,
    DepenseDiverseUpdateComponent,
    DepenseDiverseDeleteDialogComponent,
  ],
})
export class FinanceServiceDepenseDiverseModule {}
