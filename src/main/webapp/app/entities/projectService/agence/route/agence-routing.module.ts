import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { AgenceComponent } from '../list/agence.component';
import { AgenceDetailComponent } from '../detail/agence-detail.component';
import { AgenceUpdateComponent } from '../update/agence-update.component';
import { AgenceRoutingResolveService } from './agence-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const agenceRoute: Routes = [
  {
    path: '',
    component: AgenceComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: AgenceDetailComponent,
    resolve: {
      agence: AgenceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: AgenceUpdateComponent,
    resolve: {
      agence: AgenceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: AgenceUpdateComponent,
    resolve: {
      agence: AgenceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(agenceRoute)],
  exports: [RouterModule],
})
export class AgenceRoutingModule {}
