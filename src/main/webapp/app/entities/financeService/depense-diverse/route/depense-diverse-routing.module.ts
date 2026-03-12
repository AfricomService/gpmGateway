import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DepenseDiverseComponent } from '../list/depense-diverse.component';
import { DepenseDiverseDetailComponent } from '../detail/depense-diverse-detail.component';
import { DepenseDiverseUpdateComponent } from '../update/depense-diverse-update.component';
import { DepenseDiverseRoutingResolveService } from './depense-diverse-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const depenseDiverseRoute: Routes = [
  {
    path: '',
    component: DepenseDiverseComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: DepenseDiverseDetailComponent,
    resolve: {
      depenseDiverse: DepenseDiverseRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: DepenseDiverseUpdateComponent,
    resolve: {
      depenseDiverse: DepenseDiverseRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: DepenseDiverseUpdateComponent,
    resolve: {
      depenseDiverse: DepenseDiverseRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(depenseDiverseRoute)],
  exports: [RouterModule],
})
export class DepenseDiverseRoutingModule {}
