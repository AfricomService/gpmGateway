import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { MatriceJourFerieComponent } from '../list/matrice-jour-ferie.component';
import { MatriceJourFerieDetailComponent } from '../detail/matrice-jour-ferie-detail.component';
import { MatriceJourFerieUpdateComponent } from '../update/matrice-jour-ferie-update.component';
import { MatriceJourFerieRoutingResolveService } from './matrice-jour-ferie-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const matriceJourFerieRoute: Routes = [
  {
    path: '',
    component: MatriceJourFerieComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: MatriceJourFerieDetailComponent,
    resolve: {
      matriceJourFerie: MatriceJourFerieRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: MatriceJourFerieUpdateComponent,
    resolve: {
      matriceJourFerie: MatriceJourFerieRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: MatriceJourFerieUpdateComponent,
    resolve: {
      matriceJourFerie: MatriceJourFerieRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(matriceJourFerieRoute)],
  exports: [RouterModule],
})
export class MatriceJourFerieRoutingModule {}
