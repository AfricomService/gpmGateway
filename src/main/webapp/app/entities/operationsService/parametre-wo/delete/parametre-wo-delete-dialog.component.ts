import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IParametreWO } from '../parametre-wo.model';
import { ParametreWOService } from '../service/parametre-wo.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './parametre-wo-delete-dialog.component.html',
})
export class ParametreWODeleteDialogComponent {
  parametreWO?: IParametreWO;

  constructor(protected parametreWOService: ParametreWOService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.parametreWOService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
