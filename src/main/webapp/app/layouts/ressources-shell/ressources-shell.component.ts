import { Component } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface RessourceNavItem {
  label: string;
  route: string;
  icon: IconProp;
}

@Component({
  selector: 'jhi-ressources-shell',
  templateUrl: './ressources-shell.component.html',
  styleUrls: ['./ressources-shell.component.scss'],
})
export class RessourcesShellComponent {
  isSidebarCollapsed = true;

  navItems: RessourceNavItem[] = [
    { label: 'Vehicules', route: 'vehicules', icon: ['fas', 'truck'] },
    { label: 'Ressources', route: 'ressources', icon: ['fas', 'wrench'] },
  ];

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
