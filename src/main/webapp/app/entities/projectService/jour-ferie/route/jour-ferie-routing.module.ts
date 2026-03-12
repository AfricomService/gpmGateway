import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { JourFerieComponent } from '../list/jour-ferie.component';
import { JourFerieDetailComponent } from '../detail/jour-ferie-detail.component';
import { JourFerieUpdateComponent } from '../update/jour-ferie-update.component';
import { JourFerieRoutingResolveService } from './jour-ferie-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const jourFerieRoute: Routes = [
  {
    path: '',
    component: JourFerieComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: JourFerieDetailComponent,
    resolve: {
      jourFerie: JourFerieRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: JourFerieUpdateComponent,
    resolve: {
      jourFerie: JourFerieRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: JourFerieUpdateComponent,
    resolve: {
      jourFerie: JourFerieRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(jourFerieRoute)],
  exports: [RouterModule],
})
export class JourFerieRoutingModule {}
