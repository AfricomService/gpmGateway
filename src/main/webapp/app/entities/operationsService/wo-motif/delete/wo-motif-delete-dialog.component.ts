import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IWoMotif } from '../wo-motif.model';
import { WoMotifService } from '../service/wo-motif.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './wo-motif-delete-dialog.component.html',
})
export class WoMotifDeleteDialogComponent {
  woMotif?: IWoMotif;

  constructor(protected woMotifService: WoMotifService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.woMotifService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
