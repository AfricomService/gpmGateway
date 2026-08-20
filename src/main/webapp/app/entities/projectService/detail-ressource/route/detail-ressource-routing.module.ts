import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DetailRessourceComponent } from '../list/detail-ressource.component';
import { DetailRessourceDetailComponent } from '../detail/detail-ressource-detail.component';
import { DetailRessourceUpdateComponent } from '../update/detail-ressource-update.component';
import { DetailRessourceRoutingResolveService } from './detail-ressource-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const detailRessourceRoute: Routes = [
  {
    path: '',
    component: DetailRessourceComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: DetailRessourceDetailComponent,
    resolve: {
      detailRessource: DetailRessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: DetailRessourceUpdateComponent,
    resolve: {
      detailRessource: DetailRessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: DetailRessourceUpdateComponent,
    resolve: {
      detailRessource: DetailRessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(detailRessourceRoute)],
  exports: [RouterModule],
})
export class DetailRessourceRoutingModule {}
