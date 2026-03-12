import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { SSTComponent } from './list/sst.component';
import { SSTDetailComponent } from './detail/sst-detail.component';
import { SSTUpdateComponent } from './update/sst-update.component';
import { SSTDeleteDialogComponent } from './delete/sst-delete-dialog.component';
import { SSTRoutingModule } from './route/sst-routing.module';

@NgModule({
  imports: [SharedModule, SSTRoutingModule],
  declarations: [SSTComponent, SSTDetailComponent, SSTUpdateComponent, SSTDeleteDialogComponent],
})
export class OperationsServiceSSTModule {}
