import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { WoSiteComponent } from './list/wo-site.component';
import { WoSiteDetailComponent } from './detail/wo-site-detail.component';
import { WoSiteUpdateComponent } from './update/wo-site-update.component';
import { WoSiteDeleteDialogComponent } from './delete/wo-site-delete-dialog.component';
import { WoSiteRoutingModule } from './route/wo-site-routing.module';

@NgModule({
  imports: [SharedModule, WoSiteRoutingModule],
  declarations: [WoSiteComponent, WoSiteDetailComponent, WoSiteUpdateComponent, WoSiteDeleteDialogComponent],
})
export class OperationsServiceWoSiteModule {}
