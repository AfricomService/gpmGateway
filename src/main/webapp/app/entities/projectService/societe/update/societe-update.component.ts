import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SocieteFormService, SocieteFormGroup } from './societe-form.service';
import { ISociete } from '../societe.model';
import { SocieteService } from '../service/societe.service';
import { IContactSociete } from '../contact-societe.model';
import { IPersonne } from '../personne.model'; // adjust path/name to match your actual model

@Component({
  selector: 'jhi-societe-update',
  templateUrl: './societe-update.component.html',
})
export class SocieteUpdateComponent implements OnInit {
  isSaving = false;
  societe: ISociete | null = null;

  // ── Contacts Associés ─────────────────────────────────────────
  contactsAssocies: IContactSociete[] = [];
  isLoadingContacts = false;

  // ── Import depuis OrgaCare ──────────────────────────────────────
  showOrgaModal = false;

  isLoadingOrgaSocietes = false;
  orgaSocietes: ISociete[] = [];
  societeSearchTerm = '';

  selectedOrgaSociete: ISociete | null = null;

  isLoadingOrgaPersonnes = false;
  orgaPersonnes: IPersonne[] = [];
  personneSearchTerm = '';

  selectedPersonnes: IPersonne[] = [];

  editForm: SocieteFormGroup = this.societeFormService.createSocieteFormGroup();

  constructor(
    protected societeService: SocieteService,
    protected societeFormService: SocieteFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ societe }) => {
      this.societe = societe;
      if (societe) {
        this.updateForm(societe);
        this.loadContactsAssocies();
      }
    });
  }

  // ── Contacts Associés ─────────────────────────────────────────
  loadContactsAssocies(): void {
    if (!this.societe?.id) {
      return;
    }

    this.isLoadingContacts = true;
    this.societeService
      .queryContacts({ societeId: this.societe.id })
      .pipe(finalize(() => (this.isLoadingContacts = false)))
      .subscribe({
        next: (res: HttpResponse<IContactSociete[]>) => {
          this.contactsAssocies = res.body ?? [];
        },
        error: () => {
          this.contactsAssocies = [];
        },
      });
  }

  // ── Import depuis OrgaCare ──────────────────────────────────────
  openOrgaModal(): void {
    this.showOrgaModal = true;
    this.selectedOrgaSociete = null;
    this.orgaPersonnes = [];
    this.selectedPersonnes = [];
    this.societeSearchTerm = '';
    this.personneSearchTerm = '';
    this.loadOrgaSocietes();
  }

  closeOrgaModal(): void {
    this.showOrgaModal = false;
    this.selectedOrgaSociete = null;
    this.orgaPersonnes = [];
    this.selectedPersonnes = [];
  }

  loadOrgaSocietes(): void {
    this.isLoadingOrgaSocietes = true;
    this.societeService
      .queryOrgaSoc()
      .pipe(finalize(() => (this.isLoadingOrgaSocietes = false)))
      .subscribe({
        next: (res: HttpResponse<ISociete[]>) => {
          this.orgaSocietes = res.body ?? [];
        },
        error: () => {
          this.orgaSocietes = [];
        },
      });
  }

  get filteredOrgaSocietes(): ISociete[] {
    const term = this.societeSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.orgaSocietes;
    }
    return this.orgaSocietes.filter(s => (s.raisonSociale ?? '').toLowerCase().includes(term));
  }

  get filteredOrgaPersonnes(): IPersonne[] {
    const term = this.personneSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.orgaPersonnes;
    }
    return this.orgaPersonnes.filter(p => (p.nomPrenom ?? '').toLowerCase().includes(term) || (p.email ?? '').toLowerCase().includes(term));
  }

  onSocieteSearchChange(value: string): void {
    this.societeSearchTerm = value;
  }

  onPersonneSearchChange(value: string): void {
    this.personneSearchTerm = value;
  }

  selectOrgaSociete(societe: ISociete): void {
    this.selectedOrgaSociete = societe;
    this.personneSearchTerm = '';
    this.loadPersonnesFor(societe);
  }

  loadPersonnesFor(societe: ISociete): void {
    if (!societe.id) {
      this.orgaPersonnes = [];
      return;
    }

    this.isLoadingOrgaPersonnes = true;
    this.societeService
      .getPersonnesBySocieteId({ societeId: societe.id })
      .pipe(finalize(() => (this.isLoadingOrgaPersonnes = false)))
      .subscribe({
        next: res => {
          this.orgaPersonnes = res.body ?? [];
        },
        error: () => {
          this.orgaPersonnes = [];
        },
      });
  }

  // ── Sélection des personnes ─────────────────────────────────────
  isPersonneSelected(personne: IPersonne): boolean {
    return this.selectedPersonnes.some(p => p.id === personne.id);
  }

  togglePersonneSelection(personne: IPersonne): void {
    if (this.isPersonneSelected(personne)) {
      this.selectedPersonnes = this.selectedPersonnes.filter(p => p.id !== personne.id);
    } else {
      this.selectedPersonnes = [...this.selectedPersonnes, personne];
    }
  }

  removeSelectedPersonne(personne: IPersonne): void {
    this.selectedPersonnes = this.selectedPersonnes.filter(p => p.id !== personne.id);
  }

  confirmImportPersonnes(): void {
    if (this.selectedPersonnes.length === 0) {
      return;
    }

    // TODO: wire this up to the actual import/save logic once the endpoint is ready.
    // e.g. this.societeService.importContactsFromOrga(this.societe!.id, this.selectedPersonnes)...

    this.closeOrgaModal();
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const societe = this.societeFormService.getSociete(this.editForm);
    if (societe.id !== null) {
      this.subscribeToSaveResponse(this.societeService.update(societe));
    } else {
      this.subscribeToSaveResponse(this.societeService.create(societe));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISociete>>): void {
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

  protected updateForm(societe: ISociete): void {
    this.societe = societe;
    this.societeFormService.resetForm(this.editForm, societe);
  }
}
