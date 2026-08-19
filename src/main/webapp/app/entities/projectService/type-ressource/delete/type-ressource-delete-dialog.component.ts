import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ITypeRessource } from '../type-ressource.model';
import { TypeRessourceService } from '../service/type-ressource.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './type-ressource-delete-dialog.component.html',
})
export class TypeRessourceDeleteDialogComponent {
  typeRessource?: ITypeRessource;

  constructor(protected typeRessourceService: TypeRessourceService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.typeRessourceService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
