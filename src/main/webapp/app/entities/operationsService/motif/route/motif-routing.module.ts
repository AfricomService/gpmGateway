import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { MotifComponent } from '../list/motif.component';
import { MotifDetailComponent } from '../detail/motif-detail.component';
import { MotifUpdateComponent } from '../update/motif-update.component';
import { MotifRoutingResolveService } from './motif-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const motifRoute: Routes = [
  {
    path: '',
    component: MotifComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: MotifDetailComponent,
    resolve: {
      motif: MotifRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: MotifUpdateComponent,
    resolve: {
      motif: MotifRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: MotifUpdateComponent,
    resolve: {
      motif: MotifRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(motifRoute)],
  exports: [RouterModule],
})
export class MotifRoutingModule {}
