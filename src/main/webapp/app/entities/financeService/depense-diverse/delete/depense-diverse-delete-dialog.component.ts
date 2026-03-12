import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IDepenseDiverse } from '../depense-diverse.model';
import { DepenseDiverseService } from '../service/depense-diverse.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './depense-diverse-delete-dialog.component.html',
})
export class DepenseDiverseDeleteDialogComponent {
  depenseDiverse?: IDepenseDiverse;

  constructor(protected depenseDiverseService: DepenseDiverseService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.depenseDiverseService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
