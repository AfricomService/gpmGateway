import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { WoMotifComponent } from './list/wo-motif.component';
import { WoMotifDetailComponent } from './detail/wo-motif-detail.component';
import { WoMotifUpdateComponent } from './update/wo-motif-update.component';
import { WoMotifDeleteDialogComponent } from './delete/wo-motif-delete-dialog.component';
import { WoMotifRoutingModule } from './route/wo-motif-routing.module';

@NgModule({
  imports: [SharedModule, WoMotifRoutingModule],
  declarations: [WoMotifComponent, WoMotifDetailComponent, WoMotifUpdateComponent, WoMotifDeleteDialogComponent],
})
export class OperationsServiceWoMotifModule {}
