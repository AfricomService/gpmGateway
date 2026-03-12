import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ArticleMissionComponent } from './list/article-mission.component';
import { ArticleMissionDetailComponent } from './detail/article-mission-detail.component';
import { ArticleMissionUpdateComponent } from './update/article-mission-update.component';
import { ArticleMissionDeleteDialogComponent } from './delete/article-mission-delete-dialog.component';
import { ArticleMissionRoutingModule } from './route/article-mission-routing.module';

@NgModule({
  imports: [SharedModule, ArticleMissionRoutingModule],
  declarations: [
    ArticleMissionComponent,
    ArticleMissionDetailComponent,
    ArticleMissionUpdateComponent,
    ArticleMissionDeleteDialogComponent,
  ],
})
export class OperationsServiceArticleMissionModule {}
