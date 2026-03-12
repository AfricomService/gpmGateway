import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { WoUtilisateurComponent } from '../list/wo-utilisateur.component';
import { WoUtilisateurDetailComponent } from '../detail/wo-utilisateur-detail.component';
import { WoUtilisateurUpdateComponent } from '../update/wo-utilisateur-update.component';
import { WoUtilisateurRoutingResolveService } from './wo-utilisateur-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const woUtilisateurRoute: Routes = [
  {
    path: '',
    component: WoUtilisateurComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: WoUtilisateurDetailComponent,
    resolve: {
      woUtilisateur: WoUtilisateurRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: WoUtilisateurUpdateComponent,
    resolve: {
      woUtilisateur: WoUtilisateurRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: WoUtilisateurUpdateComponent,
    resolve: {
      woUtilisateur: WoUtilisateurRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(woUtilisateurRoute)],
  exports: [RouterModule],
})
export class WoUtilisateurRoutingModule {}
