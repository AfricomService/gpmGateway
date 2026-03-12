import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { AffaireArticleComponent } from '../list/affaire-article.component';
import { AffaireArticleDetailComponent } from '../detail/affaire-article-detail.component';
import { AffaireArticleUpdateComponent } from '../update/affaire-article-update.component';
import { AffaireArticleRoutingResolveService } from './affaire-article-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const affaireArticleRoute: Routes = [
  {
    path: '',
    component: AffaireArticleComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: AffaireArticleDetailComponent,
    resolve: {
      affaireArticle: AffaireArticleRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: AffaireArticleUpdateComponent,
    resolve: {
      affaireArticle: AffaireArticleRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: AffaireArticleUpdateComponent,
    resolve: {
      affaireArticle: AffaireArticleRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(affaireArticleRoute)],
  exports: [RouterModule],
})
export class AffaireArticleRoutingModule {}
