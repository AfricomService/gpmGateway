import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { NoteFraisComponent } from './list/note-frais.component';
import { NoteFraisDetailComponent } from './detail/note-frais-detail.component';
import { NoteFraisUpdateComponent } from './update/note-frais-update.component';
import { NoteFraisDeleteDialogComponent } from './delete/note-frais-delete-dialog.component';
import { NoteFraisRoutingModule } from './route/note-frais-routing.module';

@NgModule({
  imports: [SharedModule, NoteFraisRoutingModule],
  declarations: [NoteFraisComponent, NoteFraisDetailComponent, NoteFraisUpdateComponent, NoteFraisDeleteDialogComponent],
})
export class OperationsServiceNoteFraisModule {}
