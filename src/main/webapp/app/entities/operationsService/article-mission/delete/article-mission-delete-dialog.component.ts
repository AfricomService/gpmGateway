import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IArticleMission } from '../article-mission.model';
import { ArticleMissionService } from '../service/article-mission.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './article-mission-delete-dialog.component.html',
})
export class ArticleMissionDeleteDialogComponent {
  articleMission?: IArticleMission;

  constructor(protected articleMissionService: ArticleMissionService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.articleMissionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
