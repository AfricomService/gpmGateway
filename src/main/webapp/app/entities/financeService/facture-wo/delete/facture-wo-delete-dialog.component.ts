import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IFactureWO } from '../facture-wo.model';
import { FactureWOService } from '../service/facture-wo.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './facture-wo-delete-dialog.component.html',
})
export class FactureWODeleteDialogComponent {
  factureWO?: IFactureWO;

  constructor(protected factureWOService: FactureWOService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.factureWOService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
