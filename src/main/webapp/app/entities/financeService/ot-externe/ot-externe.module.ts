import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { OtExterneComponent } from './list/ot-externe.component';
import { OtExterneDetailComponent } from './detail/ot-externe-detail.component';
import { OtExterneUpdateComponent } from './update/ot-externe-update.component';
import { OtExterneDeleteDialogComponent } from './delete/ot-externe-delete-dialog.component';
import { OtExterneRoutingModule } from './route/ot-externe-routing.module';

@NgModule({
  imports: [SharedModule, OtExterneRoutingModule],
  declarations: [OtExterneComponent, OtExterneDetailComponent, OtExterneUpdateComponent, OtExterneDeleteDialogComponent],
})
export class FinanceServiceOtExterneModule {}
