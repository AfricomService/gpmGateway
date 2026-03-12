import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { OtExterneComponent } from '../list/ot-externe.component';
import { OtExterneDetailComponent } from '../detail/ot-externe-detail.component';
import { OtExterneUpdateComponent } from '../update/ot-externe-update.component';
import { OtExterneRoutingResolveService } from './ot-externe-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const otExterneRoute: Routes = [
  {
    path: '',
    component: OtExterneComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: OtExterneDetailComponent,
    resolve: {
      otExterne: OtExterneRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: OtExterneUpdateComponent,
    resolve: {
      otExterne: OtExterneRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: OtExterneUpdateComponent,
    resolve: {
      otExterne: OtExterneRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(otExterneRoute)],
  exports: [RouterModule],
})
export class OtExterneRoutingModule {}
