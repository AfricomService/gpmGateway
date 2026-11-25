import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { INoteFrais } from '../note-frais.model';
import { NoteFraisService } from '../service/note-frais.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './note-frais-delete-dialog.component.html',
})
export class NoteFraisDeleteDialogComponent {
  noteFrais?: INoteFrais;

  constructor(protected noteFraisService: NoteFraisService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.noteFraisService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
