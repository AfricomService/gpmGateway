import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { MotifComponent } from './list/motif.component';
import { MotifDetailComponent } from './detail/motif-detail.component';
import { MotifUpdateComponent } from './update/motif-update.component';
import { MotifDeleteDialogComponent } from './delete/motif-delete-dialog.component';
import { MotifRoutingModule } from './route/motif-routing.module';

@NgModule({
  imports: [SharedModule, MotifRoutingModule],
  declarations: [MotifComponent, MotifDetailComponent, MotifUpdateComponent, MotifDeleteDialogComponent],
})
export class OperationsServiceMotifModule {}
