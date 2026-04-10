import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { RessourcesShellComponent } from 'app/layouts/ressources-shell/ressources-shell.component';

const routes: Routes = [
  {
    path: '',
    component: RessourcesShellComponent,
    canActivate: [UserRouteAccessService],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'vehicules',
      },
      {
        path: 'vehicules',
        loadChildren: () => import('app/entities/projectService/vehicule/vehicule.module').then(m => m.ProjectServiceVehiculeModule),
      },
      {
        path: 'articles',
        loadChildren: () => import('app/entities/projectService/article/article.module').then(m => m.ProjectServiceArticleModule),
      },
      {
        path: 'agences',
        loadChildren: () => import('app/entities/projectService/agence/agence.module').then(m => m.ProjectServiceAgenceModule),
      },
      {
        path: 'sites',
        loadChildren: () => import('app/entities/projectService/site/site.module').then(m => m.ProjectServiceSiteModule),
      },
      {
        path: 'zones',
        loadChildren: () => import('app/entities/projectService/zone/zone.module').then(m => m.ProjectServiceZoneModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RessourcesRoutingModule {}
