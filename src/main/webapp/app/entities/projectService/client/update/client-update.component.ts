import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ClientFormService, ClientFormGroup } from './client-form.service';
import { IClient } from '../client.model';
import { ClientService } from '../service/client.service';
import { IContact } from 'app/entities/projectService/contact/contact.model';
import { ContactService } from 'app/entities/projectService/contact/service/contact.service';
import { ISite } from 'app/entities/projectService/site/site.model';
import { SiteService } from 'app/entities/projectService/site/service/site.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { FactureService } from 'app/entities/financeService/facture/service/facture.service';

@Component({
  selector: 'jhi-client-update',
  templateUrl: './client-update.component.html',
})
export class ClientUpdateComponent implements OnInit {
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

  editForm: ClientFormGroup = this.clientFormService.createClientFormGroup();

  constructor(
    protected clientService: ClientService,
    protected clientFormService: ClientFormService,
    protected contactService: ContactService,
    protected siteService: SiteService,
    protected affaireService: AffaireService,
    protected factureService: FactureService,
    protected activatedRoute: ActivatedRoute
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

  toggleContactSelection(contact: IContact): void {
    const index = this.selectedContacts.findIndex(c => c.id === contact.id);
    if (index > -1) {
      this.selectedContacts.splice(index, 1);
    } else {
      this.selectedContacts.push(contact);
    }
  }
  isContactSelected(contact: IContact): boolean {
    return this.selectedContacts.findIndex(c => c.id === contact.id) > -1;
  }

  toggleSiteSelection(site: ISite): void {
    const index = this.selectedSites.findIndex(s => s.id === site.id);
    if (index > -1) {
      this.selectedSites.splice(index, 1);
    } else {
      this.selectedSites.push(site);
    }
  }
  isSiteSelected(site: ISite): boolean {
    return this.selectedSites.findIndex(s => s.id === site.id) > -1;
  }

  toggleAffaireSelection(affaire: IAffaire): void {
    const index = this.selectedAffaires.findIndex(a => a.id === affaire.id);
    if (index > -1) {
      this.selectedAffaires.splice(index, 1);
    } else {
      this.selectedAffaires.push(affaire);
    }
  }
  isAffaireSelected(affaire: IAffaire): boolean {
    return this.selectedAffaires.findIndex(a => a.id === affaire.id) > -1;
  }

  toggleFactureSelection(facture: IFacture): void {
    const index = this.selectedFactures.findIndex(f => f.id === facture.id);
    if (index > -1) {
      this.selectedFactures.splice(index, 1);
    } else {
      this.selectedFactures.push(facture);
    }
  }
  isFactureSelected(facture: IFacture): boolean {
    return this.selectedFactures.findIndex(f => f.id === facture.id) > -1;
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
}
