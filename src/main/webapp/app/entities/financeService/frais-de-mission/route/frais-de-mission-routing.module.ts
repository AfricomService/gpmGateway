import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { FraisDeMissionComponent } from '../list/frais-de-mission.component';
import { FraisDeMissionDetailComponent } from '../detail/frais-de-mission-detail.component';
import { FraisDeMissionUpdateComponent } from '../update/frais-de-mission-update.component';
import { FraisDeMissionRoutingResolveService } from './frais-de-mission-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const fraisDeMissionRoute: Routes = [
  {
    path: '',
    component: FraisDeMissionComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: FraisDeMissionDetailComponent,
    resolve: {
      fraisDeMission: FraisDeMissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: FraisDeMissionUpdateComponent,
    resolve: {
      fraisDeMission: FraisDeMissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: FraisDeMissionUpdateComponent,
    resolve: {
      fraisDeMission: FraisDeMissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(fraisDeMissionRoute)],
  exports: [RouterModule],
})
export class FraisDeMissionRoutingModule {}
