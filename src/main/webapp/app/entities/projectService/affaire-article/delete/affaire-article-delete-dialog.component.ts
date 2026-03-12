import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IAffaireArticle } from '../affaire-article.model';
import { AffaireArticleService } from '../service/affaire-article.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './affaire-article-delete-dialog.component.html',
})
export class AffaireArticleDeleteDialogComponent {
  affaireArticle?: IAffaireArticle;

  constructor(protected affaireArticleService: AffaireArticleService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.affaireArticleService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
