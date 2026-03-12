import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IWorkOrder } from '../work-order.model';
import { WorkOrderService } from '../service/work-order.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './work-order-delete-dialog.component.html',
})
export class WorkOrderDeleteDialogComponent {
  workOrder?: IWorkOrder;

  constructor(protected workOrderService: WorkOrderService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.workOrderService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
