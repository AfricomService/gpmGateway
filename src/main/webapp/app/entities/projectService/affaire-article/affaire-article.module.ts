import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AffaireArticleComponent } from './list/affaire-article.component';
import { AffaireArticleDetailComponent } from './detail/affaire-article-detail.component';
import { AffaireArticleUpdateComponent } from './update/affaire-article-update.component';
import { AffaireArticleDeleteDialogComponent } from './delete/affaire-article-delete-dialog.component';
import { AffaireArticleRoutingModule } from './route/affaire-article-routing.module';

@NgModule({
  imports: [SharedModule, AffaireArticleRoutingModule],
  declarations: [
    AffaireArticleComponent,
    AffaireArticleDetailComponent,
    AffaireArticleUpdateComponent,
    AffaireArticleDeleteDialogComponent,
  ],
})
export class ProjectServiceAffaireArticleModule {}
