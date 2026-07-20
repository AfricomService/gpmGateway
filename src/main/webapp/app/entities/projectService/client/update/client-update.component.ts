import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ClientFormService, ClientFormGroup } from './client-form.service';
import { IClient } from '../client.model';
import { ClientService } from '../service/client.service';
import { IContact, NewContact } from 'app/entities/projectService/contact/contact.model';
import { ContactService } from 'app/entities/projectService/contact/service/contact.service';
import { ISite, NewSite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';
import { IVille } from 'app/entities/projectService/ville/ville.model';
import { VilleService } from 'app/entities/projectService/ville/service/ville.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { FactureService } from 'app/entities/financeService/facture/service/facture.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef, ViewChild } from '@angular/core';

type AccordionSection = 'general' | 'contacts' | 'sites' | 'affaires' | 'factures';

@Component({
  selector: 'jhi-client-update',
  templateUrl: './client-update.component.html',
  styleUrls: ['./client-update.component.scss'],
})
export class ClientUpdateComponent implements OnInit {
  @ViewChild('contactModal') contactModal!: TemplateRef<unknown>;
  @ViewChild('siteModal') siteModal!: TemplateRef<unknown>;

  isSaving = false;
  client: IClient | null = null;

  allContacts: IContact[] = [];
  selectedContacts: IContact[] = [];
  contactSearchTerm = '';

  allSites: ISite[] = [];
  selectedSites: ISite[] = [];
  allVilles: IVille[] = [];
  siteSearchTerm = '';
  sitesPage = 0;
  sitesItemsPerPage = 5;
  sitesTotalItems = 0;

  selectedAffaires: IAffaire[] = [];
  affaireSearchTerm = '';

  selectedFactures: IFacture[] = [];
  factureSearchTerm = '';

  newContact: Partial<NewContact> = {};
  newSite: Partial<NewSite> = {};

  editForm: ClientFormGroup = this.clientFormService.createClientFormGroup();

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general']);

  constructor(
    protected clientService: ClientService,
    protected clientFormService: ClientFormService,
    protected contactService: ContactService,
    protected siteService: SiteService,
    protected villeService: VilleService,
    protected affaireService: AffaireService,
    protected factureService: FactureService,
    protected activatedRoute: ActivatedRoute,
    protected modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ client }) => {
      this.client = client;
      if (client) {
        this.updateForm(client);
      }
      this.loadRelationships();
    });
  }

  loadRelationships(): void {
    this.villeService.query().subscribe((res: HttpResponse<IVille[]>) => {
      this.allVilles = res.body ?? [];
    });
    if (this.client?.id) {
      this.loadContacts();
      this.loadSites();
      this.loadAffaires();
      this.loadFactures();
    }
  }

  // === Accordéon ===
  toggleSection(section: AccordionSection): void {
    if (this.openSections.has(section)) {
      this.openSections.delete(section);
    } else {
      this.openSections.add(section);
    }
  }

  isSectionOpen(section: AccordionSection): boolean {
    return this.openSections.has(section);
  }

  openContactModal(): void {
    this.newContact = {};
    this.modalService.open(this.contactModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  saveNewContact(modal: any): void {
    const clientRef = this.client ? { id: this.client.id, raisonSociale: this.client.raisonSociale } : null;
    if (!clientRef || !this.newContact.raisonSociale?.trim()) {
      return;
    }

    const contactToCreate: NewContact = {
      id: null,
      raisonSociale: this.newContact.raisonSociale.trim(),
      identifiantUnique: this.newContact.identifiantUnique ?? null,
      adresse: this.newContact.adresse ?? null,
      telephone: this.newContact.telephone ?? null,
      fax: this.newContact.fax ?? null,
      email: this.newContact.email ?? null,
      client: clientRef,
    };

    this.contactService.create(contactToCreate).subscribe({
      next: () => {
        this.loadContacts();
        modal.close();
      },
      error: () => {
        // Optionnel : notifier l'utilisateur via jhi-alert-error ou toast
      },
    });
  }

  loadContacts(): void {
    if (!this.client?.id) {
      return;
    }
    const term = this.contactSearchTerm.trim();
    const request$ = term ? this.contactService.searchByClientId(this.client.id, term) : this.contactService.findByClientId(this.client.id);

    request$.subscribe((res: HttpResponse<IContact[]>) => {
      this.selectedContacts = res.body ?? [];
    });
  }

  searchContacts(): void {
    this.loadContacts();
  }

  loadAffaires(): void {
    if (!this.client?.id) {
      return;
    }
    const term = this.affaireSearchTerm.trim();
    const request$ = term ? this.affaireService.searchByClientId(this.client.id, term) : this.affaireService.findByClientId(this.client.id);

    request$.subscribe((res: HttpResponse<IAffaire[]>) => {
      this.selectedAffaires = res.body ?? [];
    });
  }

  searchAffaires(): void {
    this.loadAffaires();
  }

  loadFactures(): void {
    if (!this.client?.id) {
      return;
    }
    const term = this.factureSearchTerm.trim();
    const request$ = term ? this.factureService.searchByClientId(this.client.id, term) : this.factureService.findByClientId(this.client.id);

    request$.subscribe((res: HttpResponse<IFacture[]>) => {
      this.selectedFactures = res.body ?? [];
    });
  }

  searchFactures(): void {
    this.loadFactures();
  }

  openSiteModal(): void {
    this.newSite = { ville: null };
    this.modalService.open(this.siteModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  saveNewSite(modal: any): void {
    const clientRef = this.client ? { id: this.client.id, raisonSociale: this.client.raisonSociale } : null;
    if (!clientRef || !this.newSite.code?.trim() || !this.newSite.designation?.trim() || !this.newSite.ville) {
      return;
    }

    const siteToCreate: NewSite = {
      id: null,
      code: this.newSite.code.trim(),
      designation: this.newSite.designation.trim(),
      gpsX: this.newSite.gpsX ?? null,
      gpsY: this.newSite.gpsY ?? null,
      ville: this.newSite.ville,
      client: clientRef,
    };

    this.siteService.create(siteToCreate).subscribe({
      next: () => {
        this.loadSites();
        modal.close();
      },
      error: () => {
        // Optionnel : notifier l'utilisateur via jhi-alert-error ou toast
      },
    });
  }

  unlinkContact(contact: IContact): void {
    if (!contact.id) {
      return;
    }
    this.contactService.delete(contact.id).subscribe({
      next: () => {
        this.loadContacts();
      },
      error: () => {
        // Optionnel : notifier l'utilisateur via jhi-alert-error ou toast
      },
    });
  }

  unlinkSite(site: ISite): void {
    if (!site.id) {
      return;
    }
    this.siteService.delete(site.id).subscribe({
      next: () => {
        this.loadSites();
      },
      error: () => {
        // Optionnel : notifier l'utilisateur via jhi-alert-error ou toast
      },
    });
  }

  loadSites(): void {
    if (!this.client?.id) {
      return;
    }
    const req = { page: this.sitesPage, size: this.sitesItemsPerPage };
    const term = this.siteSearchTerm.trim();

    const request$ = term
      ? this.siteService.searchByClientId(this.client.id, term, req)
      : this.siteService.findByClientId(this.client.id, req);

    request$.subscribe((res: HttpResponse<ISite[]>) => {
      this.selectedSites = res.body ?? [];
      this.sitesTotalItems = Number(res.headers.get('X-Total-Count')) || 0;
    });
  }

  searchSites(): void {
    this.sitesPage = 0;
    this.loadSites();
  }

  sitesPreviousPage(): void {
    if (this.sitesPage > 0) {
      this.sitesPage--;
      this.loadSites();
    }
  }

  sitesNextPage(): void {
    if ((this.sitesPage + 1) * this.sitesItemsPerPage < this.sitesTotalItems) {
      this.sitesPage++;
      this.loadSites();
    }
  }

  unlinkAffaire(): void {
    // Placeholder: unlink flow will be implemented later.
  }

  unlinkFacture(): void {
    // Placeholder: unlink flow will be implemented later.
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const client = this.clientFormService.getClient(this.editForm);
    if (client.id !== null) {
      this.subscribeToSaveResponse(this.clientService.update(client));
    } else {
      this.subscribeToSaveResponse(this.clientService.identifierEtEnregistrer(client));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IClient>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(client: IClient): void {
    this.client = client;
    this.clientFormService.resetForm(this.editForm, client);
  }

  protected generateTempId(): number {
    return -Math.floor(Math.random() * 1000000000) - 1;
  }
}
