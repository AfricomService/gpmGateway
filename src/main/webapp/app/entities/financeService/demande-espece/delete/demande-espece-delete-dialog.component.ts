import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IDemandeEspece } from '../demande-espece.model';
import { DemandeEspeceService } from '../service/demande-espece.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './demande-espece-delete-dialog.component.html',
})
export class DemandeEspeceDeleteDialogComponent {
  demandeEspece?: IDemandeEspece;

  constructor(protected demandeEspeceService: DemandeEspeceService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.demandeEspeceService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
