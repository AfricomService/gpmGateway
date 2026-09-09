import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { OtExterneComponent } from './list/ot-externe.component';
import { OtExterneDetailComponent } from './detail/ot-externe-detail.component';
import { OtExterneUpdateComponent } from './update/ot-externe-update.component';
import { OtExterneDeleteDialogComponent } from './delete/ot-externe-delete-dialog.component';
import { OtExterneRoutingModule } from './route/ot-externe-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { BonCommandeSelectorModalComponent } from './bon-commande-selector-modal/bon-commande-selector-modal.component';

@NgModule({
  imports: [SharedModule, NgbAccordionModule, OtExterneRoutingModule, NgSelectModule],
  declarations: [
    OtExterneComponent,
    OtExterneDetailComponent,
    OtExterneUpdateComponent,
    OtExterneDeleteDialogComponent,
    BonCommandeSelectorModalComponent,
  ],
})
export class FinanceServiceOtExterneModule {}
