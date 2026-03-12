import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IMatriceJourFerie } from '../matrice-jour-ferie.model';
import { MatriceJourFerieService } from '../service/matrice-jour-ferie.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './matrice-jour-ferie-delete-dialog.component.html',
})
export class MatriceJourFerieDeleteDialogComponent {
  matriceJourFerie?: IMatriceJourFerie;

  constructor(protected matriceJourFerieService: MatriceJourFerieService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.matriceJourFerieService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
