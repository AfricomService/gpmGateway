import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IHistoriqueStatutWO } from '../historique-statut-wo.model';
import { HistoriqueStatutWOService } from '../service/historique-statut-wo.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './historique-statut-wo-delete-dialog.component.html',
})
export class HistoriqueStatutWODeleteDialogComponent {
  historiqueStatutWO?: IHistoriqueStatutWO;

  constructor(protected historiqueStatutWOService: HistoriqueStatutWOService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.historiqueStatutWOService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
