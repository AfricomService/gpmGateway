import { Component, Input, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { IRoleContactSociete } from 'app/entities/projectService/societe/role-contact-societe.model';
import { BonCommandeService } from '../service/bon-commande.service';
import { WorkOrderTechniciensService } from 'app/entities/operationsService/work-order/service/work-order-techniciens.service';

@Component({
  selector: 'jhi-contact-selector-modal',
  templateUrl: './contact-selector-modal.component.html',
  styleUrls: ['./contact-selector-modal.component.scss'],
})
export class ContactSelectorModalComponent implements OnInit {
  // Rôle à filtrer (ex: 'MANAGER') — fixé par le composant appelant, comme `statut` pour AffaireSelectorModalComponent.
  @Input() roleCode = 'MANAGER';
  @Input() modalTitle = 'Sélectionner un contact';
  @Input() multiple = false;
  @Input() initialSelection: IContactSociete[] = [];

  // Active la vérification de disponibilité (à passer à true pour le rôle TECHNIQUE)
  @Input() checkDisponibilite = false;

  // Work order courant à exclure du contrôle (mode édition)
  @Input() excludeWorkOrderId: number | null = null;

  contacts: IContactSociete[] = [];
  filteredContacts: IContactSociete[] = [];
  loading = false;
  searchTerm = '';

  selectedContacts: IContactSociete[] = [];

  roles: IRoleContactSociete[] = [];
  loadingRoles = false;

  // Id du contact en cours de vérification (pour désactiver/afficher un loader sur la ligne)
  checkingContactId: number | null = null;

  // Message d'erreur affiché si le technicien est indisponible
  conflictMessage: string | null = null;

  constructor(
    protected activeModal: NgbActiveModal,
    protected bonCommandeService: BonCommandeService,
    protected workOrderTechniciensService: WorkOrderTechniciensService
  ) {}

  ngOnInit(): void {
    this.selectedContacts = [...this.initialSelection];
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
    if (!this.multiple) {
      if (this.checkDisponibilite) {
        this.verifyAndRun(contact, () => this.activeModal.close(contact));
      } else {
        this.activeModal.close(contact);
      }
      return;
    }

    this.toggleSelection(contact);
  }

  toggleSelection(contact: IContactSociete): void {
    // La désélection est toujours autorisée, sans vérification
    if (this.isSelected(contact)) {
      this.selectedContacts = this.selectedContacts.filter(c => c.id !== contact.id);
      return;
    }

    if (this.checkDisponibilite) {
      this.verifyAndRun(contact, () => {
        this.selectedContacts = [...this.selectedContacts, contact];
      });
    } else {
      this.selectedContacts = [...this.selectedContacts, contact];
    }
  }

  /**
   * Vérifie la disponibilité d'un technicien avant de l'ajouter.
   * En cas de conflit, l'ajout est annulé et un message d'erreur s'affiche.
   */
  private verifyAndRun(contact: IContactSociete, onAvailable: () => void): void {
    if (contact.id === null || contact.id === undefined) {
      onAvailable();
      return;
    }

    this.conflictMessage = null;
    this.checkingContactId = contact.id;

    this.workOrderTechniciensService.checkDisponibilite([contact.id], this.excludeWorkOrderId).subscribe({
      next: res => {
        this.checkingContactId = null;
        const conflicts = res.body ?? [];

        if (conflicts.length === 0) {
          onAvailable();
          return;
        }

        const conflict = conflicts[0];
        const dateFin = conflict.dateHeureFinPrev ? new Date(conflict.dateHeureFinPrev).toLocaleString() : '';

        this.conflictMessage =
          `${contact.nomPrenom ?? 'Ce technicien'} est déjà affecté au work order ` +
          `${conflict.numFicheIntervention ?? conflict.workOrderId} (mission en cours jusqu'au ${dateFin}).`;
      },
      error: () => {
        this.checkingContactId = null;
        this.conflictMessage = 'Impossible de vérifier la disponibilité du technicien pour le moment.';
      },
    });
  }

  isSelected(contact: IContactSociete): boolean {
    return this.selectedContacts.some(c => c.id === contact.id);
  }

  confirm(): void {
    this.activeModal.close(this.selectedContacts);
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
