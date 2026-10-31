import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ParametrageDeplacementComponent } from '../list/parametrage-deplacement.component';
import { ParametrageDeplacementDetailComponent } from '../detail/parametrage-deplacement-detail.component';
import { ParametrageDeplacementUpdateComponent } from '../update/parametrage-deplacement-update.component';
import { ParametrageDeplacementRoutingResolveService } from './parametrage-deplacement-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const parametrageDeplacementRoute: Routes = [
  {
    path: '',
    component: ParametrageDeplacementComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ParametrageDeplacementDetailComponent,
    resolve: {
      parametrageDeplacement: ParametrageDeplacementRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ParametrageDeplacementUpdateComponent,
    resolve: {
      parametrageDeplacement: ParametrageDeplacementRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ParametrageDeplacementUpdateComponent,
    resolve: {
      parametrageDeplacement: ParametrageDeplacementRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(parametrageDeplacementRoute)],
  exports: [RouterModule],
})
export class ParametrageDeplacementRoutingModule {}
