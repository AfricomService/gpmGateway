import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { PhaseOtComponent } from '../list/phase-ot.component';
import { PhaseOtDetailComponent } from '../detail/phase-ot-detail.component';
import { PhaseOtUpdateComponent } from '../update/phase-ot-update.component';
import { PhaseOtRoutingResolveService } from './phase-ot-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const phaseOtRoute: Routes = [
  {
    path: '',
    component: PhaseOtComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: PhaseOtDetailComponent,
    resolve: {
      phaseOt: PhaseOtRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: PhaseOtUpdateComponent,
    resolve: {
      phaseOt: PhaseOtRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: PhaseOtUpdateComponent,
    resolve: {
      phaseOt: PhaseOtRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(phaseOtRoute)],
  exports: [RouterModule],
})
export class PhaseOtRoutingModule {}
