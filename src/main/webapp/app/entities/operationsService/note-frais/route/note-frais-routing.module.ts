import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { NoteFraisComponent } from '../list/note-frais.component';
import { NoteFraisDetailComponent } from '../detail/note-frais-detail.component';
import { NoteFraisUpdateComponent } from '../update/note-frais-update.component';
import { NoteFraisRoutingResolveService } from './note-frais-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const noteFraisRoute: Routes = [
  {
    path: '',
    component: NoteFraisComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: NoteFraisDetailComponent,
    resolve: {
      noteFrais: NoteFraisRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: NoteFraisUpdateComponent,
    resolve: {
      noteFrais: NoteFraisRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: NoteFraisUpdateComponent,
    resolve: {
      noteFrais: NoteFraisRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(noteFraisRoute)],
  exports: [RouterModule],
})
export class NoteFraisRoutingModule {}
