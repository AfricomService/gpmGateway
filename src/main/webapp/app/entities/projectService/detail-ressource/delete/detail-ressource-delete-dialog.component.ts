import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IDetailRessource } from '../detail-ressource.model';
import { DetailRessourceService } from '../service/detail-ressource.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './detail-ressource-delete-dialog.component.html',
})
export class DetailRessourceDeleteDialogComponent {
  detailRessource?: IDetailRessource;

  constructor(protected detailRessourceService: DetailRessourceService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.detailRessourceService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
