import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SocieteFormService, SocieteFormGroup } from './societe-form.service';
import { ISociete } from '../societe.model';
import { SocieteService } from '../service/societe.service';
import { IContactSociete } from '../contact-societe.model';
import { IPersonne } from '../personne.model'; // adjust path/name to match your actual model

type AccordionSection = 'general' | 'coordonnees' | 'contacts';

@Component({
  selector: 'jhi-societe-update',
  templateUrl: './societe-update.component.html',
  styleUrls: ['./societe-update.component.scss'],
})
export class SocieteUpdateComponent implements OnInit {
  isSaving = false;
  societe: ISociete | null = null;

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general', 'coordonnees']);

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

  isImportingPersonnes = false;
  importError = false;

  editForm: SocieteFormGroup = this.societeFormService.createSocieteFormGroup();

  successMessage: string | null = null;
  private successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    protected societeService: SocieteService,
    protected societeFormService: SocieteFormService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router, // <-- add
    protected location: Location // <-- add
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
    this.importError = false;
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

  // ── Import / Assignation ─────────────────────────────────────────
  confirmImportPersonnes(): void {
    if (!this.societe?.id || this.selectedPersonnes.length === 0) {
      return;
    }

    this.isImportingPersonnes = true;
    this.importError = false;

    this.societeService
      .assignContactSocieteFromOrgaCare(this.societe.id, this.selectedPersonnes)
      .pipe(finalize(() => (this.isImportingPersonnes = false)))
      .subscribe({
        next: () => {
          this.closeOrgaModal();
          this.loadContactsAssocies();
        },
        error: () => {
          this.importError = true;
        },
      });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const societe = this.societeFormService.getSociete(this.editForm);
    const isCreation = societe.id === null;

    if (!isCreation) {
      this.subscribeToSaveResponse(this.societeService.update(societe), isCreation);
    } else {
      this.subscribeToSaveResponse(this.societeService.create(societe), isCreation);
    }
  }

  areAllFilteredPersonnesSelected(): boolean {
    return (
      this.filteredOrgaPersonnes.length > 0 &&
      this.filteredOrgaPersonnes.every(person => this.selectedPersonnes.some(selected => selected.id === person.id))
    );
  }

  areSomeFilteredPersonnesSelected(): boolean {
    const selectedCount = this.filteredOrgaPersonnes.filter(person =>
      this.selectedPersonnes.some(selected => selected.id === person.id)
    ).length;

    return selectedCount > 0 && selectedCount < this.filteredOrgaPersonnes.length;
  }

  toggleSelectAllFiltered(): void {
    if (this.areAllFilteredPersonnesSelected()) {
      // Unselect only the currently filtered personnes
      this.selectedPersonnes = this.selectedPersonnes.filter(
        selected => !this.filteredOrgaPersonnes.some(person => person.id === selected.id)
      );
    } else {
      // Add only missing personnes
      this.filteredOrgaPersonnes.forEach(person => {
        if (!this.selectedPersonnes.some(selected => selected.id === person.id)) {
          this.selectedPersonnes.push(person);
        }
      });
    }
  }

  dismissSuccessMessage(): void {
    this.successMessage = null;
    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISociete>>, isCreation: boolean): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: res => this.onSaveSuccess(res.body, isCreation),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(societe: ISociete | null, isCreation: boolean): void {
    if (!societe) {
      return;
    }

    this.societe = societe;
    this.updateForm(societe);

    if (isCreation && societe.id !== null) {
      const editUrl = this.router.createUrlTree(['/societe', societe.id, 'edit']).toString();
      this.location.replaceState(editUrl);
    }

    this.loadContactsAssocies();

    // ── Success banner ─────────────────────────────
    this.successMessage = isCreation ? 'Société créée avec succès.' : 'Société mise à jour avec succès.';

    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
    this.successMessageTimeout = setTimeout(() => {
      this.successMessage = null;
    }, 2500);
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
