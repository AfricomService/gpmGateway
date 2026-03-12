import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { DemandeEspeceComponent } from '../list/demande-espece.component';
import { DemandeEspeceDetailComponent } from '../detail/demande-espece-detail.component';
import { DemandeEspeceUpdateComponent } from '../update/demande-espece-update.component';
import { DemandeEspeceRoutingResolveService } from './demande-espece-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const demandeEspeceRoute: Routes = [
  {
    path: '',
    component: DemandeEspeceComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: DemandeEspeceDetailComponent,
    resolve: {
      demandeEspece: DemandeEspeceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: DemandeEspeceUpdateComponent,
    resolve: {
      demandeEspece: DemandeEspeceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: DemandeEspeceUpdateComponent,
    resolve: {
      demandeEspece: DemandeEspeceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(demandeEspeceRoute)],
  exports: [RouterModule],
})
export class DemandeEspeceRoutingModule {}
