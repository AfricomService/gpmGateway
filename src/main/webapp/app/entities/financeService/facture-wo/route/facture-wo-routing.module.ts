import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { FactureWOComponent } from '../list/facture-wo.component';
import { FactureWODetailComponent } from '../detail/facture-wo-detail.component';
import { FactureWOUpdateComponent } from '../update/facture-wo-update.component';
import { FactureWORoutingResolveService } from './facture-wo-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const factureWORoute: Routes = [
  {
    path: '',
    component: FactureWOComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: FactureWODetailComponent,
    resolve: {
      factureWO: FactureWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: FactureWOUpdateComponent,
    resolve: {
      factureWO: FactureWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: FactureWOUpdateComponent,
    resolve: {
      factureWO: FactureWORoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(factureWORoute)],
  exports: [RouterModule],
})
export class FactureWORoutingModule {}
