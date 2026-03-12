import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IMatriceFacturation } from '../matrice-facturation.model';
import { MatriceFacturationService } from '../service/matrice-facturation.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './matrice-facturation-delete-dialog.component.html',
})
export class MatriceFacturationDeleteDialogComponent {
  matriceFacturation?: IMatriceFacturation;

  constructor(protected matriceFacturationService: MatriceFacturationService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.matriceFacturationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
