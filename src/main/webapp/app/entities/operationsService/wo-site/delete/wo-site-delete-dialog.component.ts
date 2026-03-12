import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IWoSite } from '../wo-site.model';
import { WoSiteService } from '../service/wo-site.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './wo-site-delete-dialog.component.html',
})
export class WoSiteDeleteDialogComponent {
  woSite?: IWoSite;

  constructor(protected woSiteService: WoSiteService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.woSiteService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
