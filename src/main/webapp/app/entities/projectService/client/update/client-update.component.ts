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
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { FactureService } from 'app/entities/financeService/facture/service/facture.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'jhi-client-update',
  templateUrl: './client-update.component.html',
})
export class ClientUpdateComponent implements OnInit {
  @ViewChild('contactModal') contactModal!: TemplateRef<unknown>;
  @ViewChild('siteModal') siteModal!: TemplateRef<unknown>;

  isSaving = false;
  client: IClient | null = null;

  allContacts: IContact[] = [];
  selectedContacts: IContact[] = [];

  allSites: ISite[] = [];
  selectedSites: ISite[] = [];

  allAffaires: IAffaire[] = [];
  selectedAffaires: IAffaire[] = [];

  allFactures: IFacture[] = [];
  selectedFactures: IFacture[] = [];

  newContact: Partial<NewContact> = {};
  newSite: Partial<NewSite> = {};

  editForm: ClientFormGroup = this.clientFormService.createClientFormGroup();

  constructor(
    protected clientService: ClientService,
    protected clientFormService: ClientFormService,
    protected contactService: ContactService,
    protected siteService: SiteService,
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
    this.contactService.query().subscribe((res: HttpResponse<IContact[]>) => {
      this.allContacts = res.body ?? [];
      if (this.client?.id) {
        this.selectedContacts = this.allContacts.filter(contact => contact.client?.id === this.client!.id);
      }
    });
    this.siteService.query().subscribe((res: HttpResponse<ISite[]>) => {
      this.allSites = res.body ?? [];
      if (this.client?.id) {
        this.selectedSites = this.allSites.filter(site => site.client?.id === this.client!.id);
      }
    });
    this.affaireService.query().subscribe((res: HttpResponse<IAffaire[]>) => {
      this.allAffaires = res.body ?? [];
      if (this.client?.id) {
        this.selectedAffaires = this.allAffaires.filter(affaire => affaire.client?.id === this.client!.id);
      }
    });
    this.factureService.query().subscribe((res: HttpResponse<IFacture[]>) => {
      this.allFactures = res.body ?? [];
      if (this.client?.id) {
        this.selectedFactures = this.allFactures.filter(facture => facture.clientId === this.client!.id);
      }
    });
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

    const createdContact: IContact = {
      id: this.generateTempId(),
      raisonSociale: this.newContact.raisonSociale.trim(),
      identifiantUnique: this.newContact.identifiantUnique ?? null,
      adresse: this.newContact.adresse ?? null,
      telephone: this.newContact.telephone ?? null,
      fax: this.newContact.fax ?? null,
      email: this.newContact.email ?? null,
      client: clientRef,
    };

    this.selectedContacts = [...this.selectedContacts, createdContact];
    modal.close();
  }

  openSiteModal(): void {
    this.newSite = {};
    this.modalService.open(this.siteModal, { size: 'lg', backdrop: 'static', centered: true });
  }

  saveNewSite(modal: any): void {
    const clientRef = this.client ? { id: this.client.id, raisonSociale: this.client.raisonSociale } : null;
    if (!clientRef || !this.newSite.code?.trim() || !this.newSite.designation?.trim()) {
      return;
    }

    const createdSite: ISite = {
      id: this.generateTempId(),
      code: this.newSite.code.trim(),
      designation: this.newSite.designation.trim(),
      gpsX: this.newSite.gpsX ?? null,
      gpsY: this.newSite.gpsY ?? null,
      client: clientRef,
    };

    this.selectedSites = [...this.selectedSites, createdSite];
    modal.close();
  }

  unlinkContact(): void {
    // Placeholder: unlink flow will be implemented later.
  }

  unlinkSite(): void {
    // Placeholder: unlink flow will be implemented later.
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
      this.subscribeToSaveResponse(this.clientService.create(client));
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
