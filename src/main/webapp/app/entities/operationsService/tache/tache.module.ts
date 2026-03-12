import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { TacheComponent } from './list/tache.component';
import { TacheDetailComponent } from './detail/tache-detail.component';
import { TacheUpdateComponent } from './update/tache-update.component';
import { TacheDeleteDialogComponent } from './delete/tache-delete-dialog.component';
import { TacheRoutingModule } from './route/tache-routing.module';

@NgModule({
  imports: [SharedModule, TacheRoutingModule],
  declarations: [TacheComponent, TacheDetailComponent, TacheUpdateComponent, TacheDeleteDialogComponent],
})
export class OperationsServiceTacheModule {}
