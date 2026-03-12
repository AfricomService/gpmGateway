import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { WoSiteComponent } from '../list/wo-site.component';
import { WoSiteDetailComponent } from '../detail/wo-site-detail.component';
import { WoSiteUpdateComponent } from '../update/wo-site-update.component';
import { WoSiteRoutingResolveService } from './wo-site-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const woSiteRoute: Routes = [
  {
    path: '',
    component: WoSiteComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: WoSiteDetailComponent,
    resolve: {
      woSite: WoSiteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: WoSiteUpdateComponent,
    resolve: {
      woSite: WoSiteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: WoSiteUpdateComponent,
    resolve: {
      woSite: WoSiteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(woSiteRoute)],
  exports: [RouterModule],
})
export class WoSiteRoutingModule {}
