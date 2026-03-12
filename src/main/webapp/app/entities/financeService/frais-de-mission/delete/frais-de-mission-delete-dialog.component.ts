import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IFraisDeMission } from '../frais-de-mission.model';
import { FraisDeMissionService } from '../service/frais-de-mission.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './frais-de-mission-delete-dialog.component.html',
})
export class FraisDeMissionDeleteDialogComponent {
  fraisDeMission?: IFraisDeMission;

  constructor(protected fraisDeMissionService: FraisDeMissionService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.fraisDeMissionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
