import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IArticleDemandeAchat } from '../article-demande-achat.model';
import { ArticleDemandeAchatService } from '../service/article-demande-achat.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './article-demande-achat-delete-dialog.component.html',
})
export class ArticleDemandeAchatDeleteDialogComponent {
  articleDemandeAchat?: IArticleDemandeAchat;

  constructor(protected articleDemandeAchatService: ArticleDemandeAchatService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.articleDemandeAchatService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
