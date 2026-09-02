import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faSave,
  faIdCard,
  faSitemap,
  faLevelUpAlt,
  faChevronDown,
  faBan,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

import { PhaseOtFormService, PhaseOtFormGroup } from './phase-ot-form.service';
import { IPhaseOt } from '../phase-ot.model';
import { PhaseOtService } from '../service/phase-ot.service';

type AccordionSection = 'general' | 'relations';

const STATUT_WORKFLOW = ['CREATION', 'EN_COURS', 'FIN'];

@Component({
  selector: 'jhi-phase-ot-update',
  templateUrl: './phase-ot-update.component.html',
  styleUrls: ['./phase-ot-update.component.scss'],
})
export class PhaseOtUpdateComponent implements OnInit {
  isSaving = false;
  phaseOt: IPhaseOt | null = null;

  openSections: Set<AccordionSection> = new Set(['general', 'relations']);

  // ── Liste des Phase Ots pouvant servir de parent (champ d'édition) ──────
  availablePhaseOts: IPhaseOt[] = [];
  isLoadingPhaseOts = false;
  hasParent = false;

  // ── Relations affichées (sous phases / phase parente) ───────────────────
  isParentPhase = false;
  isLoadingRelations = false;
  childrenPhaseOts: IPhaseOt[] = [];
  parentPhaseOt: IPhaseOt | null = null;

  // ── Workflow de statut ───────────────────────────────────────────────────
  isUpdatingStatut = false;

  editForm: PhaseOtFormGroup = this.phaseOtFormService.createPhaseOtFormGroup();

  successMessage: string | null = null;
  private successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    protected phaseOtService: PhaseOtService,
    protected phaseOtFormService: PhaseOtFormService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected location: Location,
    private iconLibrary: FaIconLibrary
  ) {
    this.iconLibrary.addIcons(faArrowLeft, faArrowRight, faSave, faIdCard, faSitemap, faLevelUpAlt, faChevronDown, faBan, faCheckCircle);
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ phaseOt }) => {
      this.phaseOt = phaseOt;
      if (phaseOt) {
        this.updateForm(phaseOt);
      }
      this.loadRelatedPhases();
    });

    this.loadAvailablePhaseOts();
  }

  // ── Chargement de la liste des Phase Ots (pour le champ "parent") ───────
  loadAvailablePhaseOts(): void {
    this.isLoadingPhaseOts = true;
    this.phaseOtService
      .query({ size: 1000, sort: ['nom,asc'] })
      .pipe(finalize(() => (this.isLoadingPhaseOts = false)))
      .subscribe({
        next: (res: HttpResponse<IPhaseOt[]>) => {
          const all = res.body ?? [];
          this.availablePhaseOts = this.phaseOt?.id ? all.filter(p => p.id !== this.phaseOt!.id) : all;
        },
        error: () => {
          this.availablePhaseOts = [];
        },
      });
  }

  onToggleHasParent(checked: boolean): void {
    this.hasParent = checked;
    if (!checked) {
      this.editForm.get('phaseParentId')?.setValue(null);
    }
  }

  // ── Chargement des relations (sous phases / phase parente) ──────────────
  loadRelatedPhases(): void {
    this.childrenPhaseOts = [];
    this.parentPhaseOt = null;
    this.isParentPhase = false;

    const id = this.phaseOt?.id;
    if (id === null || id === undefined) {
      return;
    }

    this.isLoadingRelations = true;
    this.phaseOtService
      .isParent(id)
      .pipe(finalize(() => (this.isLoadingRelations = false)))
      .subscribe({
        next: isParent => {
          this.isParentPhase = isParent;
          if (isParent) {
            this.loadChildren(id);
          } else if (this.phaseOt?.phaseParentId !== null && this.phaseOt?.phaseParentId !== undefined) {
            this.loadParent(this.phaseOt.phaseParentId);
          }
        },
        error: () => {
          this.isParentPhase = false;
        },
      });
  }

  private loadChildren(phaseOtId: number): void {
    this.phaseOtService.findChildren(phaseOtId).subscribe({
      next: res => {
        this.childrenPhaseOts = res.body ?? [];
      },
      error: () => {
        this.childrenPhaseOts = [];
      },
    });
  }

  private loadParent(parentId: number): void {
    this.phaseOtService.find(parentId).subscribe({
      next: res => {
        this.parentPhaseOt = res.body ?? null;
      },
      error: () => {
        this.parentPhaseOt = null;
      },
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

  // ── Workflow de statut : CREATION → EN_COURS → FIN ───────────────────────
  canAdvanceStatut(): boolean {
    if (!this.phaseOt?.id || !this.phaseOt?.statut) {
      return false;
    }
    const idx = STATUT_WORKFLOW.indexOf(this.phaseOt.statut);
    return idx >= 0 && idx < STATUT_WORKFLOW.length - 1;
  }

  nextStatut(): string | null {
    if (!this.phaseOt?.statut) {
      return null;
    }
    const idx = STATUT_WORKFLOW.indexOf(this.phaseOt.statut);
    if (idx < 0 || idx >= STATUT_WORKFLOW.length - 1) {
      return null;
    }
    return STATUT_WORKFLOW[idx + 1];
  }

  nextStatutLabel(): string {
    return this.nextStatut() ?? '';
  }

  advanceStatut(): void {
    const next = this.nextStatut();
    if (!this.phaseOt?.id || !next) {
      return;
    }

    this.isUpdatingStatut = true;
    this.phaseOtService
      .updateStatut(this.phaseOt.id, next)
      .pipe(finalize(() => (this.isUpdatingStatut = false)))
      .subscribe({
        next: (res: HttpResponse<IPhaseOt>) => {
          if (res.body) {
            this.updateForm(res.body);
            this.loadRelatedPhases();
          }
          this.showSuccessMessage(`Statut mis à jour : ${next}.`);
        },
      });
  }

  statutBadgeClass(statut?: string | null): string {
    switch (statut) {
      case 'CREATION':
        return 'is-creation';
      case 'EN_COURS':
        return 'is-en-cours';
      case 'FIN':
        return 'is-fin';
      default:
        return '';
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const phaseOt = this.phaseOtFormService.getPhaseOt(this.editForm);
    const isCreation = phaseOt.id === null;

    if (!isCreation) {
      this.subscribeToSaveResponse(this.phaseOtService.update(phaseOt), isCreation);
    } else {
      this.subscribeToSaveResponse(this.phaseOtService.create(phaseOt), isCreation);
    }
  }

  dismissSuccessMessage(): void {
    this.successMessage = null;
    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPhaseOt>>, isCreation: boolean): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: res => this.onSaveSuccess(res.body, isCreation),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(phaseOt: IPhaseOt | null, isCreation: boolean): void {
    if (!phaseOt) {
      return;
    }

    this.updateForm(phaseOt);
    this.loadAvailablePhaseOts();
    this.loadRelatedPhases();

    if (isCreation && phaseOt.id !== null) {
      const editUrl = this.router.createUrlTree(['/ot-externe/phase-ot', phaseOt.id, 'edit']).toString();
      this.location.replaceState(editUrl);
    }

    this.showSuccessMessage(isCreation ? 'Phase Ot créé avec succès.' : 'Phase Ot mis à jour avec succès.');
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(phaseOt: IPhaseOt): void {
    this.phaseOt = phaseOt;
    this.phaseOtFormService.resetForm(this.editForm, phaseOt);
    this.hasParent = phaseOt.phaseParentId !== null && phaseOt.phaseParentId !== undefined;
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    if (this.successMessageTimeout) {
      clearTimeout(this.successMessageTimeout);
    }
    this.successMessageTimeout = setTimeout(() => {
      this.successMessage = null;
    }, 2500);
  }
}
