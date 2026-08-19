import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { TypeRessourceComponent } from '../list/type-ressource.component';
import { TypeRessourceDetailComponent } from '../detail/type-ressource-detail.component';
import { TypeRessourceUpdateComponent } from '../update/type-ressource-update.component';
import { TypeRessourceRoutingResolveService } from './type-ressource-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const typeRessourceRoute: Routes = [
  {
    path: '',
    component: TypeRessourceComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: TypeRessourceDetailComponent,
    resolve: {
      typeRessource: TypeRessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: TypeRessourceUpdateComponent,
    resolve: {
      typeRessource: TypeRessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: TypeRessourceUpdateComponent,
    resolve: {
      typeRessource: TypeRessourceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(typeRessourceRoute)],
  exports: [RouterModule],
})
export class TypeRessourceRoutingModule {}
