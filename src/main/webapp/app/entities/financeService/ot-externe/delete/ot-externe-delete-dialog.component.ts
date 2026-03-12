import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IOtExterne } from '../ot-externe.model';
import { OtExterneService } from '../service/ot-externe.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './ot-externe-delete-dialog.component.html',
})
export class OtExterneDeleteDialogComponent {
  otExterne?: IOtExterne;

  constructor(protected otExterneService: OtExterneService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.otExterneService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
