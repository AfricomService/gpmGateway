import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ParametreWOComponent } from './list/parametre-wo.component';
import { ParametreWODetailComponent } from './detail/parametre-wo-detail.component';
import { ParametreWOUpdateComponent } from './update/parametre-wo-update.component';
import { ParametreWODeleteDialogComponent } from './delete/parametre-wo-delete-dialog.component';
import { ParametreWORoutingModule } from './route/parametre-wo-routing.module';

@NgModule({
  imports: [SharedModule, ParametreWORoutingModule],
  declarations: [ParametreWOComponent, ParametreWODetailComponent, ParametreWOUpdateComponent, ParametreWODeleteDialogComponent],
})
export class OperationsServiceParametreWOModule {}
