import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { AffaireComponent } from '../list/affaire.component';
import { AffaireDetailComponent } from '../detail/affaire-detail.component';
import { AffaireUpdateComponent } from '../update/affaire-update.component';
import { AffaireRoutingResolveService } from './affaire-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const affaireRoute: Routes = [
  {
    path: '',
    component: AffaireComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: AffaireDetailComponent,
    resolve: {
      affaire: AffaireRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: AffaireUpdateComponent,
    resolve: {
      affaire: AffaireRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: AffaireUpdateComponent,
    resolve: {
      affaire: AffaireRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(affaireRoute)],
  exports: [RouterModule],
})
export class AffaireRoutingModule {}
