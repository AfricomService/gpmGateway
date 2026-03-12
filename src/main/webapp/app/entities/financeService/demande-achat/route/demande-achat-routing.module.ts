import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DemandeAchatComponent } from '../list/demande-achat.component';
import { DemandeAchatDetailComponent } from '../detail/demande-achat-detail.component';
import { DemandeAchatUpdateComponent } from '../update/demande-achat-update.component';
import { DemandeAchatRoutingResolveService } from './demande-achat-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const demandeAchatRoute: Routes = [
  {
    path: '',
    component: DemandeAchatComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: DemandeAchatDetailComponent,
    resolve: {
      demandeAchat: DemandeAchatRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: DemandeAchatUpdateComponent,
    resolve: {
      demandeAchat: DemandeAchatRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: DemandeAchatUpdateComponent,
    resolve: {
      demandeAchat: DemandeAchatRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(demandeAchatRoute)],
  exports: [RouterModule],
})
export class DemandeAchatRoutingModule {}
