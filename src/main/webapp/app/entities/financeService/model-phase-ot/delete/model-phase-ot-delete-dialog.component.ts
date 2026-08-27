import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IModelPhaseOT } from '../model-phase-ot.model';
import { ModelPhaseOTService } from '../service/model-phase-ot.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './model-phase-ot-delete-dialog.component.html',
})
export class ModelPhaseOTDeleteDialogComponent {
  modelPhaseOT?: IModelPhaseOT;

  constructor(protected modelPhaseOTService: ModelPhaseOTService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.modelPhaseOTService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
