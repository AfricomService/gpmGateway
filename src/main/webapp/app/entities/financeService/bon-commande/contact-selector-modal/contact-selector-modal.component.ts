import { Component, Input, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
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

  constructor(protected activeModal: NgbActiveModal, protected bonCommandeService: BonCommandeService) {}

  ngOnInit(): void {
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
