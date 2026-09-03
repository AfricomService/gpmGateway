import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import { ModelPhaseOTFormService, ModelPhaseOTFormGroup } from './model-phase-ot-form.service';
import { IModelPhaseOT } from '../model-phase-ot.model';
import { ModelPhaseOTService } from '../service/model-phase-ot.service';

import { ILiaisonModelPhaseOT } from './liaison-model-phase-ot.model';
import { LiaisonModelPhaseOTService } from './liaison-model-phase-ot.service';
import { IPhaseOt } from '../../phase-ot/phase-ot.model';
import { PhaseOtService } from '../../phase-ot/service/phase-ot.service';

type AccordionSection = 'general' | 'phases';

@Component({
  selector: 'jhi-model-phase-ot-update',
  templateUrl: './model-phase-ot-update.component.html',
  styleUrls: ['./model-phase-ot-update.component.scss'],
})
export class ModelPhaseOTUpdateComponent implements OnInit {
  isSaving = false;
  modelPhaseOT: IModelPhaseOT | null = null;

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general', 'phases']);

  // Icons
  faArrowUp: IconDefinition = faArrowUp;
  faArrowDown: IconDefinition = faArrowDown;

  editForm: ModelPhaseOTFormGroup = this.modelPhaseOTFormService.createModelPhaseOTFormGroup();

  successMessage: string | null = null;

  // ── Phases Associées ─────────────────────────────────────────────────────
  phasesAssociees: ILiaisonModelPhaseOT[] = [];
  isLoadingPhases = false;

  /** All PhaseOt in the system, used to resolve names and to build the "add" dropdown. */
  allPhaseOts: IPhaseOt[] = [];
  isLoadingAllPhaseOts = false;

  selectedPhaseIdToAdd: number | null = null;
  isAssigningPhase = false;

  movingLiaisonId: number | null = null;
  removingLiaisonId: number | null = null;

  private successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    protected modelPhaseOTService: ModelPhaseOTService,
    protected modelPhaseOTFormService: ModelPhaseOTFormService,
    protected liaisonModelPhaseOTService: LiaisonModelPhaseOTService,
    protected phaseOtService: PhaseOtService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected location: Location
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ modelPhaseOT }) => {
      this.modelPhaseOT = modelPhaseOT;
      if (modelPhaseOT) {
        this.updateForm(modelPhaseOT);
        this.loadPhasesAssociees();
      }
    });
    // The dropdown of assignable phases is needed whether we're creating or editing,
    // since creation flips into "edit" in place once the save succeeds.
    this.loadAllPhaseOts();
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

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const modelPhaseOT = this.modelPhaseOTFormService.getModelPhaseOT(this.editForm);
    const isCreation = modelPhaseOT.id === null;

    if (!isCreation) {
      this.subscribeToSaveResponse(this.modelPhaseOTService.update(modelPhaseOT), isCreation);
    } else {
      this.subscribeToSaveResponse(this.modelPhaseOTService.create(modelPhaseOT), isCreation);
    }
  }

  // ── Phases Associées ─────────────────────────────────────────────────────

  loadPhasesAssociees(): void {
    if (!this.modelPhaseOT?.id) {
      return;
    }
    this.isLoadingPhases = true;
    this.liaisonModelPhaseOTService
      .findByModel(this.modelPhaseOT.id)
      .pipe(finalize(() => (this.isLoadingPhases = false)))
      .subscribe({
        next: liaisons => (this.phasesAssociees = liaisons),
        error: () => (this.phasesAssociees = []),
      });
  }

  loadAllPhaseOts(): void {
    this.isLoadingAllPhaseOts = true;
    this.phaseOtService
      .query({ size: 2000 })
      .pipe(finalize(() => (this.isLoadingAllPhaseOts = false)))
      .subscribe({
        next: (res: HttpResponse<IPhaseOt[]>) => (this.allPhaseOts = res.body ?? []),
        error: () => (this.allPhaseOts = []),
      });
  }

  /** Details (nom, description, ...) of the PhaseOt behind a given id. */
  getPhaseDetails(phaseId: number | null | undefined): IPhaseOt | undefined {
    return this.allPhaseOts.find(p => p.id === phaseId);
  }

  /** PhaseOts not yet linked to this model — feeds the "add a phase" dropdown. */
  get availablePhaseOtsToAdd(): IPhaseOt[] {
    const linkedIds = new Set(this.phasesAssociees.map(l => l.phaseId));
    return this.allPhaseOts.filter(p => !linkedIds.has(p.id));
  }

  /** Small, non-blocking UI hint: a model should be made of at least two phases. */
  get hasEnoughPhases(): boolean {
    return this.phasesAssociees.length >= 2;
  }

  assignPhase(): void {
    if (!this.modelPhaseOT?.id || !this.selectedPhaseIdToAdd) {
      return;
    }
    this.isAssigningPhase = true;
    this.liaisonModelPhaseOTService
      .assign(this.modelPhaseOT.id, this.selectedPhaseIdToAdd)
      .pipe(finalize(() => (this.isAssigningPhase = false)))
      .subscribe({
        next: () => {
          this.selectedPhaseIdToAdd = null;
          this.loadPhasesAssociees();
        },
      });
  }

  removePhase(liaison: ILiaisonModelPhaseOT): void {
    this.removingLiaisonId = liaison.id;
    this.liaisonModelPhaseOTService
      .unassign(liaison.id)
      .pipe(finalize(() => (this.removingLiaisonId = null)))
      .subscribe({
        next: () => this.loadPhasesAssociees(),
      });
  }

  movePhaseUp(liaison: ILiaisonModelPhaseOT): void {
    this.movingLiaisonId = liaison.id;
    this.liaisonModelPhaseOTService
      .moveUp(liaison.id)
      .pipe(finalize(() => (this.movingLiaisonId = null)))
      .subscribe({
        next: updated => (this.phasesAssociees = updated),
      });
  }

  movePhaseDown(liaison: ILiaisonModelPhaseOT): void {
    this.movingLiaisonId = liaison.id;
    this.liaisonModelPhaseOTService
      .moveDown(liaison.id)
      .pipe(finalize(() => (this.movingLiaisonId = null)))
      .subscribe({
        next: updated => (this.phasesAssociees = updated),
      });
  }

  isFirstPhase(liaison: ILiaisonModelPhaseOT): boolean {
    return this.phasesAssociees.length > 0 && this.phasesAssociees[0].id === liaison.id;
  }

  isLastPhase(liaison: ILiaisonModelPhaseOT): boolean {
    return this.phasesAssociees.length > 0 && this.phasesAssociees[this.phasesAssociees.length - 1].id === liaison.id;
  }

  /** "1ère", "2ème", "3ème"... for display next to each linked phase. */
  ordinalLabel(index: number): string {
    const n = index + 1;
    return n === 1 ? '1ère' : `${n}ème`;
  }

  dismissSuccessMessage(): void {
    this.successMessage = null;
    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IModelPhaseOT>>, isCreation: boolean): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: res => this.onSaveSuccess(res.body, isCreation),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(modelPhaseOT: IModelPhaseOT | null, isCreation: boolean): void {
    if (!modelPhaseOT) {
      return;
    }

    this.modelPhaseOT = modelPhaseOT;
    this.updateForm(modelPhaseOT);

    if (isCreation && modelPhaseOT.id !== null) {
      // Swap the URL from /new to /:id/edit in place, without a full navigation,
      // so the "Phases associées" section can appear right after creation.
      const editUrl = this.router.createUrlTree(['/ot-externe/model-phase-ot', modelPhaseOT.id, 'edit']).toString();
      this.location.replaceState(editUrl);
    }

    this.loadPhasesAssociees();

    this.successMessage = isCreation
      ? 'Model Phase OT créé avec succès. Vous pouvez maintenant lui associer des phases.'
      : 'Model Phase OT mis à jour avec succès.';

    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
    this.successMessageTimeout = setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(modelPhaseOT: IModelPhaseOT): void {
    this.modelPhaseOT = modelPhaseOT;
    this.modelPhaseOTFormService.resetForm(this.editForm, modelPhaseOT);
  }
}
