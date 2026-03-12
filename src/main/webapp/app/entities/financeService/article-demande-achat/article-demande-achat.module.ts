import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ArticleDemandeAchatComponent } from './list/article-demande-achat.component';
import { ArticleDemandeAchatDetailComponent } from './detail/article-demande-achat-detail.component';
import { ArticleDemandeAchatUpdateComponent } from './update/article-demande-achat-update.component';
import { ArticleDemandeAchatDeleteDialogComponent } from './delete/article-demande-achat-delete-dialog.component';
import { ArticleDemandeAchatRoutingModule } from './route/article-demande-achat-routing.module';

@NgModule({
  imports: [SharedModule, ArticleDemandeAchatRoutingModule],
  declarations: [
    ArticleDemandeAchatComponent,
    ArticleDemandeAchatDetailComponent,
    ArticleDemandeAchatUpdateComponent,
    ArticleDemandeAchatDeleteDialogComponent,
  ],
})
export class FinanceServiceArticleDemandeAchatModule {}
