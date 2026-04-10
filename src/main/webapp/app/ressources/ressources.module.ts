import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { RessourcesShellComponent } from 'app/layouts/ressources-shell/ressources-shell.component';
import { RessourcesRoutingModule } from './ressources-routing.module';

@NgModule({
  imports: [SharedModule, RessourcesRoutingModule],
  declarations: [RessourcesShellComponent],
})
export class RessourcesModule {}
