import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { MatriceFacturationComponent } from '../list/matrice-facturation.component';
import { MatriceFacturationDetailComponent } from '../detail/matrice-facturation-detail.component';
import { MatriceFacturationUpdateComponent } from '../update/matrice-facturation-update.component';
import { MatriceFacturationRoutingResolveService } from './matrice-facturation-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const matriceFacturationRoute: Routes = [
  {
    path: '',
    component: MatriceFacturationComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: MatriceFacturationDetailComponent,
    resolve: {
      matriceFacturation: MatriceFacturationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: MatriceFacturationUpdateComponent,
    resolve: {
      matriceFacturation: MatriceFacturationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: MatriceFacturationUpdateComponent,
    resolve: {
      matriceFacturation: MatriceFacturationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(matriceFacturationRoute)],
  exports: [RouterModule],
})
export class MatriceFacturationRoutingModule {}
