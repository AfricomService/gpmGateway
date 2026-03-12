import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { HistoriqueStatutWOComponent } from '../list/historique-statut-wo.component';
import { HistoriqueStatutWODetailComponent } from '../detail/historique-statut-wo-detail.component';
import { HistoriqueStatutWOUpdateComponent } from '../update/historique-statut-wo-update.component';
import { HistoriqueStatutWORoutingResolveService } from './historique-statut-wo-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const historiqueStatutWORoute: Routes = [
  {
    path: '',
    component: HistoriqueStatutWOComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: HistoriqueStatutWODetailComponent,
    resolve: {
      historiqueStatutWO: HistoriqueStatutWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: HistoriqueStatutWOUpdateComponent,
    resolve: {
      historiqueStatutWO: HistoriqueStatutWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: HistoriqueStatutWOUpdateComponent,
    resolve: {
      historiqueStatutWO: HistoriqueStatutWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(historiqueStatutWORoute)],
  exports: [RouterModule],
})
export class HistoriqueStatutWORoutingModule {}
