import { Component } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface RessourceNavChildItem {
  label: string;
  route: string;
}

interface RessourceNavItem {
  label: string;
  route?: string; // optionnel maintenant : un item avec enfants n'a pas de route propre
  icon: IconProp;
  children?: RessourceNavChildItem[];
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
    {
      label: 'Paramètre ressources',
      icon: ['fas', 'cog'],
      children: [{ label: 'Detail Ressource', route: 'detail-ressource' }],
    },
  ];

  expandedGroup: string | null = null;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleGroup(item: RessourceNavItem): void {
    // en mode réduit, on déplie automatiquement la sidebar pour voir la sous-liste
    if (this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
    }
    this.expandedGroup = this.expandedGroup === item.label ? null : item.label;
  }
}
