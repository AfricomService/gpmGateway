import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ActiviteComponent } from '../list/activite.component';
import { ActiviteDetailComponent } from '../detail/activite-detail.component';
import { ActiviteUpdateComponent } from '../update/activite-update.component';
import { ActiviteRoutingResolveService } from './activite-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const activiteRoute: Routes = [
  {
    path: '',
    component: ActiviteComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ActiviteDetailComponent,
    resolve: {
      activite: ActiviteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ActiviteUpdateComponent,
    resolve: {
      activite: ActiviteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ActiviteUpdateComponent,
    resolve: {
      activite: ActiviteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(activiteRoute)],
  exports: [RouterModule],
})
export class ActiviteRoutingModule {}
