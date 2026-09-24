import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ArticleComponent } from './list/article.component';
import { ArticleDetailComponent } from './detail/article-detail.component';
import { ArticleUpdateComponent } from './update/article-update.component';
import { ArticleDeleteDialogComponent } from './delete/article-delete-dialog.component';
import { ArticleRoutingModule } from './route/article-routing.module';
import { ArticleSelectorModalComponent } from './article-selector-modal.component';

@NgModule({
  imports: [SharedModule, ArticleRoutingModule],
  declarations: [
    ArticleComponent,
    ArticleDetailComponent,
    ArticleUpdateComponent,
    ArticleDeleteDialogComponent,
    ArticleSelectorModalComponent,
  ],
})
export class ProjectServiceArticleModule {}
