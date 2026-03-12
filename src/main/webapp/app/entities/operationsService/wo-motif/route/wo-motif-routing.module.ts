import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { WoMotifComponent } from '../list/wo-motif.component';
import { WoMotifDetailComponent } from '../detail/wo-motif-detail.component';
import { WoMotifUpdateComponent } from '../update/wo-motif-update.component';
import { WoMotifRoutingResolveService } from './wo-motif-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const woMotifRoute: Routes = [
  {
    path: '',
    component: WoMotifComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: WoMotifDetailComponent,
    resolve: {
      woMotif: WoMotifRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: WoMotifUpdateComponent,
    resolve: {
      woMotif: WoMotifRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: WoMotifUpdateComponent,
    resolve: {
      woMotif: WoMotifRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(woMotifRoute)],
  exports: [RouterModule],
})
export class WoMotifRoutingModule {}
