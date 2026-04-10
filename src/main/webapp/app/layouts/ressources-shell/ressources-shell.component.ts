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
  isSidebarCollapsed = false;

  navItems: RessourceNavItem[] = [
    { label: 'Vehicules', route: 'vehicules', icon: ['fas', 'truck'] },
    { label: 'Articles', route: 'articles', icon: ['fas', 'th-list'] },
    { label: 'Agences', route: 'agences', icon: ['fas', 'users'] },
    { label: 'Sites', route: 'sites', icon: ['fas', 'road'] },
    { label: 'Zones', route: 'zones', icon: ['fas', 'th'] },
  ];

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
