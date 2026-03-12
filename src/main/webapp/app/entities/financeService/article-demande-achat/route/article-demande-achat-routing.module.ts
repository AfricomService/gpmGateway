import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ArticleDemandeAchatComponent } from '../list/article-demande-achat.component';
import { ArticleDemandeAchatDetailComponent } from '../detail/article-demande-achat-detail.component';
import { ArticleDemandeAchatUpdateComponent } from '../update/article-demande-achat-update.component';
import { ArticleDemandeAchatRoutingResolveService } from './article-demande-achat-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const articleDemandeAchatRoute: Routes = [
  {
    path: '',
    component: ArticleDemandeAchatComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ArticleDemandeAchatDetailComponent,
    resolve: {
      articleDemandeAchat: ArticleDemandeAchatRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ArticleDemandeAchatUpdateComponent,
    resolve: {
      articleDemandeAchat: ArticleDemandeAchatRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ArticleDemandeAchatUpdateComponent,
    resolve: {
      articleDemandeAchat: ArticleDemandeAchatRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(articleDemandeAchatRoute)],
  exports: [RouterModule],
})
export class ArticleDemandeAchatRoutingModule {}
