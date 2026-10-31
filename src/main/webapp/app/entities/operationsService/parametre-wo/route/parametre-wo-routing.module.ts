import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ParametreWOComponent } from '../list/parametre-wo.component';
import { ParametreWODetailComponent } from '../detail/parametre-wo-detail.component';
import { ParametreWOUpdateComponent } from '../update/parametre-wo-update.component';
import { ParametreWORoutingResolveService } from './parametre-wo-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const parametreWORoute: Routes = [
  {
    path: '',
    component: ParametreWOComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ParametreWODetailComponent,
    resolve: {
      parametreWO: ParametreWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ParametreWOUpdateComponent,
    resolve: {
      parametreWO: ParametreWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ParametreWOUpdateComponent,
    resolve: {
      parametreWO: ParametreWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(parametreWORoute)],
  exports: [RouterModule],
})
export class ParametreWORoutingModule {}
