import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { TacheComponent } from '../list/tache.component';
import { TacheDetailComponent } from '../detail/tache-detail.component';
import { TacheUpdateComponent } from '../update/tache-update.component';
import { TacheRoutingResolveService } from './tache-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const tacheRoute: Routes = [
  {
    path: '',
    component: TacheComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: TacheDetailComponent,
    resolve: {
      tache: TacheRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: TacheUpdateComponent,
    resolve: {
      tache: TacheRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: TacheUpdateComponent,
    resolve: {
      tache: TacheRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(tacheRoute)],
  exports: [RouterModule],
})
export class TacheRoutingModule {}
