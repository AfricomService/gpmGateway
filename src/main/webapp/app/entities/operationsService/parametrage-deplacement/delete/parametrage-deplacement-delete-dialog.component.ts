import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IParametrageDeplacement } from '../parametrage-deplacement.model';
import { ParametrageDeplacementService } from '../service/parametrage-deplacement.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './parametrage-deplacement-delete-dialog.component.html',
})
export class ParametrageDeplacementDeleteDialogComponent {
  parametrageDeplacement?: IParametrageDeplacement;

  constructor(protected parametrageDeplacementService: ParametrageDeplacementService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.parametrageDeplacementService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
