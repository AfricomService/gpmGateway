import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IJourFerie } from '../jour-ferie.model';
import { JourFerieService } from '../service/jour-ferie.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './jour-ferie-delete-dialog.component.html',
})
export class JourFerieDeleteDialogComponent {
  jourFerie?: IJourFerie;

  constructor(protected jourFerieService: JourFerieService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.jourFerieService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
