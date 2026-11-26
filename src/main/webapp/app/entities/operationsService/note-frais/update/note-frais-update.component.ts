import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { NumsequentielleService } from 'app/entities/projectService/numsequentielle/service/numsequentielle.service';
import dayjs from 'dayjs/esm';

import { NoteFraisFormService, NoteFraisFormGroup } from './note-frais-form.service';
import { INoteFrais } from '../note-frais.model';
import { NoteFraisService } from '../service/note-frais.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MissionService } from 'app/entities/operationsService/mission/service/mission.service';
import { IMissionLigne } from 'app/entities/operationsService/mission/mission.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { BonCommandeService } from 'app/entities/financeService/bon-commande/service/bon-commande.service';
import { ContactSelectorModalComponent } from 'app/entities/financeService/bon-commande/contact-selector-modal/contact-selector-modal.component';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { SocieteService } from 'app/entities/projectService/societe/service/societe.service';

type AccordionPanel = 'general' | 'missions' | 'montants';

// Société dont les contacts sont proposés comme bénéficiaires (id résolu côté backend)
const RAISON_SOCIALE_BENEFICIAIRES = 'Africom Services';

@Component({
  selector: 'jhi-note-frais-update',
  templateUrl: './note-frais-update.component.html',
  styleUrls: ['./note-frais-update.component.scss'],
})
export class NoteFraisUpdateComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private searchSub?: Subscription;
  private lettresSub?: Subscription;

  isSaving = false;
  noteFrais: INoteFrais | null = null;

  // Accordéon (état purement visuel)
  openPanels: Set<AccordionPanel> = new Set<AccordionPanel>(['general', 'missions', 'montants']);

  // Missions trouvées pour la période Du / Au (date début réelle du work order)
  missions: IMissionLigne[] = [];
  // Raison sociale du client final, par clientId
  clientNames: Record<number, string> = {};
  loadingMissions = false;
  missionsSearched = false;
  missionsError = '';

  // Missions cochées pour la note de frais
  selectedMissionIds = new Set<number>();

  // Personne bénéficiaire (contactSocieteId de la mission, persisté sur la note de frais)
  selectedBeneficiaire: IContactSociete | null = null;
  // Id de la société « Africom Services » (résolu une seule fois)
  private societeBeneficiairesId: number | null = null;

  editForm: NoteFraisFormGroup = this.noteFraisFormService.createNoteFraisFormGroup();

  constructor(
    protected noteFraisService: NoteFraisService,
    protected noteFraisFormService: NoteFraisFormService,
    protected activatedRoute: ActivatedRoute,
    protected missionService: MissionService,
    protected modalService: NgbModal,
    protected bonCommandeService: BonCommandeService,
    protected clientService: ClientService,
    protected numsequentielleService: NumsequentielleService,
    protected societeService: SocieteService,
    protected router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ noteFrais }) => {
      this.noteFrais = noteFrais;
      if (noteFrais) {
        this.updateForm(noteFrais);
      }
    });

    // Recherche automatique dès que la période et le bénéficiaire changent
    merge(
      this.editForm.controls.dateDebut.valueChanges,
      this.editForm.controls.dateFin.valueChanges,
      this.editForm.controls.contactSocieteId.valueChanges
    )
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => this.searchMissions());
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.lettresSub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================================
  // Accordéon
  // ================================
  togglePanel(panel: AccordionPanel): void {
    if (this.openPanels.has(panel)) {
      this.openPanels.delete(panel);
    } else {
      this.openPanels.add(panel);
    }
  }

  isPanelOpen(panel: AccordionPanel): boolean {
    return this.openPanels.has(panel);
  }

  /** Création : les missions sont choisies dans la liste. Édition : elles sont déjà rattachées. */
  get isNew(): boolean {
    return this.editForm.controls.id.value === null;
  }

  get allMissionsSelected(): boolean {
    return this.missions.length > 0 && this.selectedMissionIds.size === this.missions.length;
  }

  isMissionSelected(id: number): boolean {
    return this.selectedMissionIds.has(id);
  }

  toggleMission(id: number): void {
    if (this.selectedMissionIds.has(id)) {
      this.selectedMissionIds.delete(id);
    } else {
      this.selectedMissionIds.add(id);
    }
    this.refreshMontantTotal();
  }

  toggleAllMissions(): void {
    if (this.allMissionsSelected) {
      this.selectedMissionIds.clear();
    } else {
      this.missions.forEach(m => this.selectedMissionIds.add(m.id as number));
    }
    this.refreshMontantTotal();
  }

  /** Affichage seulement : le backend recalcule la somme et le montant en lettres à l'enregistrement. */
  private refreshMontantTotal(): void {
    // Mode édition : les montants enregistrés ne doivent pas être écrasés
    if (!this.isNew) {
      return;
    }

    const total = this.missions
      .filter(m => this.selectedMissionIds.has(m.id as number))
      .reduce((sum, m) => sum + Number(m.montantTotale ?? 0), 0);
    const arrondi = Math.round(total * 100) / 100;

    this.editForm.patchValue({ montantTotale: arrondi, montantTotaleEnLettre: null });

    // Une réponse plus ancienne ne doit pas écraser la sélection courante
    this.lettresSub?.unsubscribe();
    if (this.selectedMissionIds.size === 0) {
      return;
    }

    this.lettresSub = this.noteFraisService.montantEnLettres(arrondi).subscribe({
      next: lettres => this.editForm.patchValue({ montantTotaleEnLettre: lettres }),
    });
  }

  get beneficiaireLabel(): string {
    return this.selectedBeneficiaire?.nomPrenom ?? '';
  }

  openBeneficiaireModal(): void {
    this.resolveSocieteBeneficiairesId().subscribe({
      next: societeId => this.openBeneficiaireModalForSociete(societeId),
      error: () => (this.missionsError = 'Société « ' + RAISON_SOCIALE_BENEFICIAIRES + ' » introuvable.'),
    });
  }

  /** Retrouve (puis met en cache) l'id de la société dont la raison sociale est « Africom Services ». */
  private resolveSocieteBeneficiairesId(): Observable<number> {
    if (this.societeBeneficiairesId !== null) {
      return of(this.societeBeneficiairesId);
    }
    return this.societeService.findByRaisonSociale(RAISON_SOCIALE_BENEFICIAIRES).pipe(
      map(res => {
        const id = res.body?.id;
        if (id === null || id === undefined) {
          throw new Error('Société introuvable');
        }
        return id;
      }),
      tap(id => (this.societeBeneficiairesId = id))
    );
  }

  private openBeneficiaireModalForSociete(societeId: number): void {
    const modalRef = this.modalService.open(ContactSelectorModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      windowClass: 'contact-selector-modal-window',
    });

    modalRef.componentInstance.modalTitle = 'Sélectionner un bénéficiaire';
    modalRef.componentInstance.societeId = societeId;
    modalRef.componentInstance.initialSelection = this.selectedBeneficiaire ? [this.selectedBeneficiaire] : [];

    modalRef.result
      .then((contact: IContactSociete) => {
        if (contact) {
          this.onBeneficiaireSelected(contact);
        }
      })
      .catch(() => {});
  }

  onBeneficiaireSelected(contact: IContactSociete | null): void {
    this.selectedBeneficiaire = contact;
    this.editForm.patchValue({ contactSocieteId: contact?.id ?? null });
    // Le critère a changé : les résultats précédents ne sont plus valables
    this.missions = [];
    this.missionsSearched = false;
    this.selectedMissionIds.clear();
    this.refreshMontantTotal();
  }

  /** Période valide : les deux dates saisies et Au >= Du. */
  get periodeValide(): boolean {
    const debut = this.editForm.get('dateDebut')?.value;
    const fin = this.editForm.get('dateFin')?.value;
    return !!debut && !!fin && !dayjs(fin as any).isBefore(dayjs(debut as any));
  }

  /** Les trois critères sont obligatoires : Du, Au (Au >= Du) et le bénéficiaire. */
  get rechercheComplete(): boolean {
    const beneficiaire = this.editForm.get('contactSocieteId')?.value;
    return this.periodeValide && beneficiaire !== null && beneficiaire !== undefined;
  }

  private searchMissions(): void {
    // Toute recherche en cours est annulée (critères modifiés entre-temps)
    this.searchSub?.unsubscribe();

    if (!this.isNew || !this.rechercheComplete) {
      this.missions = [];
      this.missionsSearched = false;
      this.missionsError = '';
      this.selectedMissionIds.clear();
      this.refreshMontantTotal();
      return;
    }

    const debut = dayjs(this.editForm.get('dateDebut')?.value as any)
      .startOf('day')
      .toISOString();
    const fin = dayjs(this.editForm.get('dateFin')?.value as any)
      .endOf('day')
      .toISOString();
    const contactSocieteId = this.editForm.get('contactSocieteId')?.value ?? null;

    this.loadingMissions = true;
    this.missionsError = '';

    this.searchSub = this.missionService
      .findByPeriode(debut, fin, contactSocieteId)
      .pipe(finalize(() => (this.loadingMissions = false)))
      .subscribe({
        next: res => {
          this.missions = res.body ?? [];
          this.missionsSearched = true;
          this.selectedMissionIds.clear();
          this.refreshMontantTotal();
          this.loadClientNames();
        },
        error: () => {
          this.missions = [];
          this.selectedMissionIds.clear();
          this.missionsError = 'Erreur lors de la recherche des missions.';
        },
      });
  }

  /** Charge la raison sociale des clients finaux des missions affichées (un appel par client distinct). */
  private loadClientNames(): void {
    const ids = Array.from(
      new Set(this.missions.map(m => m.clientId).filter((id): id is number => id !== null && id !== undefined))
    ).filter(id => this.clientNames[id] === undefined);

    if (ids.length === 0) {
      return;
    }

    forkJoin(ids.map(id => this.clientService.find(id))).subscribe({
      next: responses =>
        responses.forEach((r, i) => {
          this.clientNames[ids[i]] = r.body?.raisonSociale ?? '';
        }),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const noteFrais = this.noteFraisFormService.getNoteFrais(this.editForm);
    if (noteFrais.id !== null) {
      this.subscribeToSaveResponse(this.noteFraisService.update(noteFrais));
    } else {
      // Création : on génère l'identifiant unique juste avant l'enregistrement
      const create$ = this.numsequentielleService
        .generateIdentifiantNoteFrais()
        .pipe(
          switchMap(res =>
            this.noteFraisService.createFromMissions({ ...noteFrais, identifiantUnique: res.body }, Array.from(this.selectedMissionIds))
          )
        );
      this.subscribeToSaveResponse(create$);
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<INoteFrais>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: res => this.onSaveSuccess(res.body),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(saved?: INoteFrais | null): void {
    if (this.isNew && saved?.id !== null && saved?.id !== undefined) {
      // Création : de .../note-frais/new vers .../note-frais/{id}/edit (préfixe conservé)
      this.router.navigate(['../', saved.id, 'edit'], { relativeTo: this.activatedRoute, replaceUrl: true });
    } else {
      this.previousState();
    }
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(noteFrais: INoteFrais): void {
    this.noteFrais = noteFrais;
    this.noteFraisFormService.resetForm(this.editForm, noteFrais);

    // Mode édition : retrouve le libellé du bénéficiaire enregistré
    if (noteFrais.contactSocieteId !== null && noteFrais.contactSocieteId !== undefined) {
      this.bonCommandeService.findResponsableById(Number(noteFrais.contactSocieteId)).subscribe({
        next: res => (this.selectedBeneficiaire = res.body ?? null),
      });
    }
  }
}
