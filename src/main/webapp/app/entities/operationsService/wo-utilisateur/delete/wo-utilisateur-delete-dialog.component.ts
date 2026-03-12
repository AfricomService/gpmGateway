import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IWoUtilisateur } from '../wo-utilisateur.model';
import { WoUtilisateurService } from '../service/wo-utilisateur.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './wo-utilisateur-delete-dialog.component.html',
})
export class WoUtilisateurDeleteDialogComponent {
  woUtilisateur?: IWoUtilisateur;

  constructor(protected woUtilisateurService: WoUtilisateurService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.woUtilisateurService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
