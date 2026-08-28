import { Component, Input, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { IRoleContactSociete } from 'app/entities/projectService/societe/role-contact-societe.model';
import { BonCommandeService } from '../service/bon-commande.service';

@Component({
  selector: 'jhi-contact-selector-modal',
  templateUrl: './contact-selector-modal.component.html',
  styleUrls: ['./contact-selector-modal.component.scss'],
})
export class ContactSelectorModalComponent implements OnInit {
  // Rôle à filtrer (ex: 'MANAGER') — fixé par le composant appelant, comme `statut` pour AffaireSelectorModalComponent.
  @Input() roleCode = 'MANAGER';

  // Titre affiché dans l'en-tête — permet de réutiliser ce modal pour "Responsable" et "Autre Responsable".
  @Input() modalTitle = 'Sélectionner un contact';

  contacts: IContactSociete[] = [];
  filteredContacts: IContactSociete[] = [];
  loading = false;
  searchTerm = '';

  // Boutons de filtre par rôle (alimentés depuis la table role_contact_societe)
  roles: IRoleContactSociete[] = [];
  loadingRoles = false;

  constructor(protected activeModal: NgbActiveModal, protected bonCommandeService: BonCommandeService) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadContacts();
  }

  /**
   * Appelé au clic sur un bouton de rôle (CHAUFFEUR / TECHNIQUE / MANAGER, etc.).
   * Recharge la liste des contacts filtrée par le rôle sélectionné.
   */
  selectRole(role: IRoleContactSociete): void {
    if (!role.code || role.code === this.roleCode) {
      return;
    }

    this.roleCode = role.code;
    this.searchTerm = '';
    this.loadContacts();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  select(contact: IContactSociete): void {
    this.activeModal.close(contact);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  private loadContacts(): void {
    this.loading = true;

    this.bonCommandeService.findResponsablesByRole(this.roleCode).subscribe({
      next: (res: HttpResponse<IContactSociete[]>) => {
        this.contacts = res.body ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.contacts = [];
        this.filteredContacts = [];
        this.loading = false;
      },
    });
  }

  private loadRoles(): void {
    this.loadingRoles = true;

    this.bonCommandeService.findAllRoles().subscribe({
      next: (res: HttpResponse<IRoleContactSociete[]>) => {
        this.roles = res.body ?? [];
        this.loadingRoles = false;
      },
      error: () => {
        this.roles = [];
        this.loadingRoles = false;
      },
    });
  }

  private applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredContacts = !term
      ? this.contacts
      : this.contacts.filter(
          c =>
            (c.nomPrenom ?? '').toLowerCase().includes(term) ||
            (c.email ?? '').toLowerCase().includes(term) ||
            (c.matricule ?? '').toLowerCase().includes(term)
        );
  }
}
