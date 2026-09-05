import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IPhaseOt } from '../phase-ot.model';
import { PhaseOtService } from '../service/phase-ot.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './phase-ot-delete-dialog.component.html',
})
export class PhaseOtDeleteDialogComponent {
  phaseOt?: IPhaseOt;

  constructor(protected phaseOtService: PhaseOtService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.phaseOtService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
