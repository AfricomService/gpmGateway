import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { WoUtilisateurComponent } from './list/wo-utilisateur.component';
import { WoUtilisateurDetailComponent } from './detail/wo-utilisateur-detail.component';
import { WoUtilisateurUpdateComponent } from './update/wo-utilisateur-update.component';
import { WoUtilisateurDeleteDialogComponent } from './delete/wo-utilisateur-delete-dialog.component';
import { WoUtilisateurRoutingModule } from './route/wo-utilisateur-routing.module';

@NgModule({
  imports: [SharedModule, WoUtilisateurRoutingModule],
  declarations: [WoUtilisateurComponent, WoUtilisateurDetailComponent, WoUtilisateurUpdateComponent, WoUtilisateurDeleteDialogComponent],
})
export class OperationsServiceWoUtilisateurModule {}
