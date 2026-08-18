import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { RessourceComponent } from '../list/ressource.component';
import { RessourceDetailComponent } from '../detail/ressource-detail.component';
import { RessourceUpdateComponent } from '../update/ressource-update.component';
import { RessourceRoutingResolveService } from './ressource-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const ressourceRoute: Routes = [
  {
    path: '',
    component: RessourceComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: RessourceDetailComponent,
    resolve: {
      ressource: RessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: RessourceUpdateComponent,
    resolve: {
      ressource: RessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: RessourceUpdateComponent,
    resolve: {
      ressource: RessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ressourceRoute)],
  exports: [RouterModule],
})
export class RessourceRoutingModule {}
