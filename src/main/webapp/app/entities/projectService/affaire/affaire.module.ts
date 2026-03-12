import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AffaireComponent } from './list/affaire.component';
import { AffaireDetailComponent } from './detail/affaire-detail.component';
import { AffaireUpdateComponent } from './update/affaire-update.component';
import { AffaireDeleteDialogComponent } from './delete/affaire-delete-dialog.component';
import { AffaireRoutingModule } from './route/affaire-routing.module';

@NgModule({
  imports: [SharedModule, AffaireRoutingModule],
  declarations: [AffaireComponent, AffaireDetailComponent, AffaireUpdateComponent, AffaireDeleteDialogComponent],
})
export class ProjectServiceAffaireModule {}
