import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { SSTComponent } from '../list/sst.component';
import { SSTDetailComponent } from '../detail/sst-detail.component';
import { SSTUpdateComponent } from '../update/sst-update.component';
import { SSTRoutingResolveService } from './sst-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const sSTRoute: Routes = [
  {
    path: '',
    component: SSTComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: SSTDetailComponent,
    resolve: {
      sST: SSTRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: SSTUpdateComponent,
    resolve: {
      sST: SSTRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: SSTUpdateComponent,
    resolve: {
      sST: SSTRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(sSTRoute)],
  exports: [RouterModule],
})
export class SSTRoutingModule {}
