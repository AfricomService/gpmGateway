import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ClientFormService, ClientFormGroup } from './client-form.service';
import { IClient } from '../client.model';
import { ClientService } from '../service/client.service';
import { IContact, NewContact } from 'app/entities/projectService/contact/contact.model';
import { ContactService } from 'app/entities/projectService/contact/service/contact.service';
import { ISite, NewSite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';
import { SiteImportService, ISiteImportResult } from 'app/entities/projectService/site/service/site-import.service';
import { IVille } from 'app/entities/projectService/ville/ville.model';
import { VilleService } from 'app/entities/projectService/ville/service/ville.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { FactureService } from 'app/entities/financeService/facture/service/facture.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef, ViewChild } from '@angular/core';

import { IAgence, NewAgence } from 'app/entities/projectService/agence/agence.model';
import { AgenceService } from 'app/entities/projectService/agence/service/agence.service';
import { ISociete } from 'app/entities/projectService/societe/societe.model';
import { SocieteService } from 'app/entities/projectService/societe/service/societe.service';

type AccordionSection = 'general' | 'contacts' | 'sites' | 'affaires' | 'factures' | 'agences';

@Component({
  selector: 'jhi-client-update',
  templateUrl: './client-update.component.html',
  styleUrls: ['./client-update.component.scss'],
})
export class ClientUpdateComponent implements OnInit {
  @ViewChild('contactModal') contactModal!: TemplateRef<unknown>;
  @ViewChild('siteModal') siteModal!: TemplateRef<unknown>;
  @ViewChild('agenceModal') agenceModal!: TemplateRef<unknown>;
  @ViewChild('siteImportModal') siteImportModal!: TemplateRef<unknown>;
  @ViewChild('keycloakResultModal') keycloakResultModal!: TemplateRef<unknown>;

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

  selectedAgences: IAgence[] = [];
  agenceSearchTerm = '';
  allSocietes: ISociete[] = [];
  newAgence: Partial<NewAgence> = {};

  newContact: Partial<NewContact | IContact> = {};
  editingContact: IContact | null = null;
  newSite: Partial<NewSite> = {};

  siteImportFile: File | null = null;
  siteImportInProgress = false;
  siteImportResult: ISiteImportResult | null = null;
  siteImportDragOver = false;

  editForm: ClientFormGroup = this.clientFormService.createClientFormGroup();

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general']);

  constructor(
    protected clientService: ClientService,
    protected clientFormService: ClientFormService,
    protected contactService: ContactService,
    protected siteService: SiteService,
    protected siteImportService: SiteImportService,
    protected villeService: VilleService,
    protected affaireService: AffaireService,
    protected factureService: FactureService,
    protected agenceService: AgenceService,
    protected societeService: SocieteService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
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

    this.editForm.get('raisonSociale')?.valueChanges.subscribe(() => {
      const control = this.editForm.get('raisonSociale');
      if (control?.errors?.raisonSocialeExists) {
        const { raisonSocialeExists, ...rest } = control.errors;
        control.setErrors(Object.keys(rest).length ? rest : null);
      }
    });
  }

  loadRelationships(): void {
    this.villeService.query().subscribe((res: HttpResponse<IVille[]>) => {
      this.allVilles = res.body ?? [];
    });
    this.societeService.query().subscribe((res: HttpResponse<ISociete[]>) => {
      this.allSocietes = res.body ?? [];
    });
    if (this.client?.id) {
      this.loadContacts();
      this.loadSites();
      this.loadAffaires();
      this.loadFactures();
      this.loadAgences();
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
    this.editingContact = null;
    this.newContact = {};
    this.modalService.open(this.contactModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  openEditContactModal(contact: IContact): void {
    this.editingContact = contact;
    this.newContact = { ...contact };
    this.modalService.open(this.contactModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  // === Navigation vers les interfaces d'édition ===
  goToContact(contact: IContact): void {
    if (!contact.id) {
      return;
    }
    this.router.navigate(['/contact', contact.id, 'edit']);
  }

  goToSite(site: ISite): void {
    if (!site.id) {
      return;
    }
    this.router.navigate(['/site', site.id, 'edit']);
  }

  goToAffaire(affaire: IAffaire): void {
    if (!affaire.id) {
      return;
    }
    this.router.navigate(['/affaire', affaire.id, 'edit']);
  }

  goToFacture(facture: IFacture): void {
    if (!facture.id) {
      return;
    }
    this.router.navigate(['/facture', facture.id, 'edit']);
  }

  goToAgence(agence: IAgence): void {
    if (!agence.id) {
      return;
    }
    this.router.navigate(['/agence', agence.id, 'edit']);
  }

  creatingKeycloakUser = false;
  keycloakResult: { success: boolean; nomPrenom?: string; login?: string; password?: string; message?: string } | null = null;

  createContactKeycloakUser(): void {
    if (!this.editingContact?.id) {
      return;
    }
    this.creatingKeycloakUser = true;
    this.contactService.createKeycloakUser(this.editingContact.id).subscribe({
      next: res => {
        this.creatingKeycloakUser = false;
        const result = res.body;
        const updatedContact = result?.contact;
        this.editingContact = updatedContact ?? this.editingContact;
        this.loadContacts();

        this.keycloakResult = {
          success: true,
          nomPrenom: updatedContact?.nomPrenom ?? undefined,
          login: updatedContact?.identifiantUnique ?? undefined,
          password: result?.generatedPassword ?? undefined,
        };
        this.modalService.open(this.keycloakResultModal, { size: 'md', backdrop: 'static', centered: true });
      },
      error: err => {
        this.creatingKeycloakUser = false;
        this.keycloakResult = {
          success: false,
          message: err.error?.detail ?? err.error?.title ?? 'Erreur lors de la création de l’utilisateur Keycloak',
        };
        this.modalService.open(this.keycloakResultModal, { size: 'md', backdrop: 'static', centered: true });
      },
    });
  }

  resettingPassword = false;

  resetContactPassword(): void {
    if (!this.editingContact?.id) {
      return;
    }
    this.resettingPassword = true;
    this.contactService.resetKeycloakPassword(this.editingContact.id).subscribe({
      next: res => {
        this.resettingPassword = false;
        const result = res.body;
        this.keycloakResult = {
          success: true,
          nomPrenom: result?.contact?.nomPrenom ?? undefined,
          login: result?.contact?.identifiantUnique ?? undefined,
          password: result?.generatedPassword ?? undefined,
        };
        this.modalService.open(this.keycloakResultModal, { size: 'md', backdrop: 'static', centered: true });
      },
      error: err => {
        this.resettingPassword = false;
        this.keycloakResult = {
          success: false,
          message: err.error?.detail ?? err.error?.title ?? 'Erreur lors de la réinitialisation du mot de passe',
        };
        this.modalService.open(this.keycloakResultModal, { size: 'md', backdrop: 'static', centered: true });
      },
    });
  }

  saveContact(modal: any): void {
    const clientRef = this.client ? { id: this.client.id, raisonSociale: this.client.raisonSociale } : null;
    if (!clientRef || !this.newContact.nomPrenom?.trim()) {
      return;
    }

    if (this.editingContact) {
      // Mode édition : on repart de l'objet existant pour ne pas écraser
      // les champs non présents dans la modale (identifiantUnique, createdAt, createdBy, client, etc.)
      const contactToUpdate: IContact = {
        ...this.editingContact,
        nomPrenom: this.newContact.nomPrenom.trim(),
        adresse: this.newContact.adresse ?? null,
        telephone: this.newContact.telephone ?? null,
        fax: this.newContact.fax ?? null,
        email: this.newContact.email ?? null,
      };

      this.contactService.update(contactToUpdate).subscribe({
        next: () => {
          this.loadContacts();
          modal.close();
        },
        error: () => {
          // Optionnel : notifier l'utilisateur via jhi-alert-error ou toast
        },
      });
      return;
    }

    const contactToCreate: NewContact = {
      id: null,
      nomPrenom: this.newContact.nomPrenom.trim(),
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

  loadAgences(): void {
    if (!this.client?.id) {
      return;
    }
    const term = this.agenceSearchTerm.trim();
    const request$ = term ? this.agenceService.searchByClientId(this.client.id, term) : this.agenceService.findByClientId(this.client.id);

    request$.subscribe((res: HttpResponse<IAgence[]>) => {
      this.selectedAgences = res.body ?? [];
    });
  }

  searchAgences(): void {
    this.loadAgences();
  }

  openAgenceModal(): void {
    this.newAgence = {};
    this.modalService.open(this.agenceModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  saveNewAgence(modal: any): void {
    if (
      !this.client?.id ||
      !this.newAgence.designation?.trim() ||
      !this.newAgence.adresse?.trim() ||
      !this.newAgence.ville?.trim() ||
      !this.newAgence.pays?.trim()
    ) {
      return;
    }

    const agenceToCreate: NewAgence = {
      id: null,
      designation: this.newAgence.designation.trim(),
      adresse: this.newAgence.adresse.trim(),
      ville: this.newAgence.ville.trim(),
      pays: this.newAgence.pays.trim(),
      clientId: this.client.id,
    };

    this.agenceService.create(agenceToCreate).subscribe({
      next: () => {
        this.loadAgences();
        modal.close();
      },
      error: () => {
        // Optionnel : notifier l'utilisateur via jhi-alert-error ou toast
      },
    });
  }

  unlinkAgence(): void {
    // Placeholder: unlink flow will be implemented later.
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
      nodaleGpm: this.newSite.nodaleGpm?.trim() ?? null,
      sitePriority: this.newSite.sitePriority?.trim() ?? null,
      typeSite: this.newSite.typeSite?.trim() ?? null,
      regionSite: this.newSite.regionSite?.trim() ?? null,
      zoneNom: this.newSite.zoneNom?.trim() ?? null,
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

  openSiteImportModal(): void {
    this.siteImportFile = null;
    this.siteImportResult = null;
    this.modalService.open(this.siteImportModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  onSiteImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.siteImportFile = input.files && input.files.length > 0 ? input.files[0] : null;
    this.siteImportResult = null;
  }

  submitSiteImport(): void {
    if (!this.client?.id || !this.siteImportFile) {
      return;
    }

    this.siteImportInProgress = true;
    this.siteImportService.importSites(this.client.id, this.siteImportFile).subscribe({
      next: response => {
        this.siteImportResult = response.body;
        this.siteImportInProgress = false;
        this.loadSites();
      },
      error: () => {
        this.siteImportInProgress = false;
      },
    });
  }

  downloadSiteTemplate(): void {
    this.siteImportService.downloadTemplate().subscribe(response => {
      const blob = response.body;
      if (!blob) {
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modele_import_sites.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  onSiteImportDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.siteImportDragOver = true;
  }

  onSiteImportDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.siteImportDragOver = false;
  }

  onSiteImportDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.siteImportDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.siteImportFile = files[0];
      this.siteImportResult = null;
    }
  }

  removeSiteImportFile(): void {
    this.siteImportFile = null;
    this.siteImportResult = null;
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

  activerClient(): void {
    if (!this.client?.id) {
      return;
    }
    this.clientService.activer(this.client.id).subscribe({
      next: res => {
        if (res.body) {
          this.client = res.body;
          this.editForm.patchValue({ status: res.body.status });
        }
      },
    });
  }

  desactiverClient(): void {
    if (!this.client?.id) {
      return;
    }
    this.clientService.desactiver(this.client.id).subscribe({
      next: res => {
        if (res.body) {
          this.client = res.body;
          this.editForm.patchValue({ status: res.body.status });
        }
      },
    });
  }

  save(): void {
    this.isSaving = true;
    const client = this.clientFormService.getClient(this.editForm);
    const isNewClient = client.id === null;
    if (!isNewClient) {
      this.subscribeToSaveResponse(this.clientService.update(client), isNewClient);
    } else {
      this.subscribeToSaveResponse(this.clientService.identifierEtEnregistrer(client), isNewClient);
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IClient>>, isNewClient: boolean): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: res => this.onSaveSuccess(res, isNewClient),
      error: err => this.onSaveError(err),
    });
  }

  protected onSaveSuccess(res: HttpResponse<IClient>, isNewClient: boolean): void {
    if (isNewClient && res.body?.id) {
      this.router.navigate(['/client', res.body.id, 'edit']);
    } else {
      this.previousState();
    }
  }

  protected onSaveError(err?: any): void {
    if (err?.error?.errorKey === 'raisonsocialeexists') {
      this.editForm.get('raisonSociale')?.setErrors({ raisonSocialeExists: true });
      this.editForm.get('raisonSociale')?.markAsTouched();
    }
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
