import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ArticleMissionComponent } from '../list/article-mission.component';
import { ArticleMissionDetailComponent } from '../detail/article-mission-detail.component';
import { ArticleMissionUpdateComponent } from '../update/article-mission-update.component';
import { ArticleMissionRoutingResolveService } from './article-mission-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const articleMissionRoute: Routes = [
  {
    path: '',
    component: ArticleMissionComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ArticleMissionDetailComponent,
    resolve: {
      articleMission: ArticleMissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ArticleMissionUpdateComponent,
    resolve: {
      articleMission: ArticleMissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ArticleMissionUpdateComponent,
    resolve: {
      articleMission: ArticleMissionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(articleMissionRoute)],
  exports: [RouterModule],
})
export class ArticleMissionRoutingModule {}
