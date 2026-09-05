import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ModelPhaseOTComponent } from '../list/model-phase-ot.component';
import { ModelPhaseOTDetailComponent } from '../detail/model-phase-ot-detail.component';
import { ModelPhaseOTUpdateComponent } from '../update/model-phase-ot-update.component';
import { ModelPhaseOTRoutingResolveService } from './model-phase-ot-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const modelPhaseOTRoute: Routes = [
  {
    path: '',
    component: ModelPhaseOTComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ModelPhaseOTDetailComponent,
    resolve: {
      modelPhaseOT: ModelPhaseOTRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ModelPhaseOTUpdateComponent,
    resolve: {
      modelPhaseOT: ModelPhaseOTRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ModelPhaseOTUpdateComponent,
    resolve: {
      modelPhaseOT: ModelPhaseOTRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(modelPhaseOTRoute)],
  exports: [RouterModule],
})
export class ModelPhaseOTRoutingModule {}
