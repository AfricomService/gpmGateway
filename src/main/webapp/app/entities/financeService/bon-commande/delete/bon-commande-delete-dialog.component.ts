import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IBonCommande } from '../bon-commande.model';
import { BonCommandeService } from '../service/bon-commande.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './bon-commande-delete-dialog.component.html',
})
export class BonCommandeDeleteDialogComponent {
  bonCommande?: IBonCommande;

  constructor(protected bonCommandeService: BonCommandeService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.bonCommandeService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
