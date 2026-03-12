import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { VehiculeComponent } from '../list/vehicule.component';
import { VehiculeDetailComponent } from '../detail/vehicule-detail.component';
import { VehiculeUpdateComponent } from '../update/vehicule-update.component';
import { VehiculeRoutingResolveService } from './vehicule-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const vehiculeRoute: Routes = [
  {
    path: '',
    component: VehiculeComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: VehiculeDetailComponent,
    resolve: {
      vehicule: VehiculeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: VehiculeUpdateComponent,
    resolve: {
      vehicule: VehiculeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: VehiculeUpdateComponent,
    resolve: {
      vehicule: VehiculeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(vehiculeRoute)],
  exports: [RouterModule],
})
export class VehiculeRoutingModule {}
