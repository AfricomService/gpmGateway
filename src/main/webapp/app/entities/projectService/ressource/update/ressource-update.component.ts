import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { RessourceFormService, RessourceFormGroup } from './ressource-form.service';
import { IRessource } from '../ressource.model';
import { RessourceService } from '../service/ressource.service';
import { ITypeRessource } from 'app/entities/projectService/type-ressource/type-ressource.model';
import { TypeRessourceService } from 'app/entities/projectService/type-ressource/service/type-ressource.service';
import { IDetailRessource } from 'app/entities/projectService/detail-ressource/detail-ressource.model';

type AccordionSection = 'general' | 'detail' | 'maintenance';

@Component({
  selector: 'jhi-ressource-update',
  templateUrl: './ressource-update.component.html',
  styleUrls: ['./ressource-update.component.scss'],
})
export class RessourceUpdateComponent implements OnInit {
  isSaving = false;
  ressource: IRessource | null = null;

  editForm: RessourceFormGroup = this.ressourceFormService.createRessourceFormGroup();

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general', 'maintenance']);

  // === Liste des types ressource (pour le select) ===
  typeRessources: ITypeRessource[] = [];

  // === Détails dynamiques (dépendent du Type Ressource sélectionné) ===
  detailRessourceFields: IDetailRessource[] = [];
  detailRessourceValues: { [code: string]: any } = {};
  loadingDetailRessourceFields = false;
  validationDetailRessourceErrors: { [code: string]: string } = {};

  // === Gestion du statut de la ressource ===
  ressourceStatuts: string[] = ['Disponible', 'EnMission', 'EnMaintenance', 'HorsService'];
  changingStatut = false;

  constructor(
    protected ressourceService: RessourceService,
    protected ressourceFormService: RessourceFormService,
    protected activatedRoute: ActivatedRoute,
    protected typeRessourceService: TypeRessourceService,
    protected router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ ressource }) => {
      this.ressource = ressource;
      if (ressource) {
        this.updateForm(ressource);
      }
    });

    this.typeRessourceService.queryList().subscribe({
      next: (res: HttpResponse<ITypeRessource[]>) => {
        this.typeRessources = res.body ?? [];

        // Si une ressource existante a déjà un typeRessourceId, on charge ses détails
        const currentTypeId = this.editForm.get('typeRessourceId')?.value;
        if (currentTypeId) {
          this.loadDetailRessourceFields(currentTypeId);
        }
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

  // === Détails dynamiques selon le Type Ressource sélectionné ===
  onTypeRessourceChange(): void {
    const typeId = this.editForm.get('typeRessourceId')?.value;
    if (!typeId) {
      this.detailRessourceFields = [];
      this.detailRessourceValues = {};
      this.validationDetailRessourceErrors = {};
      return;
    }
    this.loadDetailRessourceFields(typeId);
  }

  private loadDetailRessourceFields(typeRessourceId: number): void {
    this.detailRessourceFields = [];
    this.detailRessourceValues = {};
    this.validationDetailRessourceErrors = {};
    this.loadingDetailRessourceFields = true;

    this.typeRessourceService.findDetails(typeRessourceId).subscribe({
      next: (res: HttpResponse<IDetailRessource[]>) => {
        this.detailRessourceFields = (res.body || [])
          .filter(f => f.status !== false)
          .map(f => ({ ...f, inputType: this.normalizeInputType(f.inputType) }));

        const existingValues = this.ressource?.additionalInfo || [];

        this.detailRessourceFields.forEach(f => {
          if (!f.code) return;
          const existing = existingValues.find(v => v.code === f.code);
          if (existing) {
            this.detailRessourceValues[f.code] = f.inputType === 'checkbox' ? existing.value === 'true' : existing.value ?? '';
          } else {
            this.detailRessourceValues[f.code] = f.inputType === 'checkbox' ? false : '';
          }
        });

        if (this.detailRessourceFields.length > 0 && !this.openSections.has('detail')) {
          this.openSections.add('detail');
        }

        this.loadingDetailRessourceFields = false;
      },
      error: () => {
        this.detailRessourceFields = [];
        this.loadingDetailRessourceFields = false;
      },
    });
  }

  /**
   * Normalise les inputType renvoyés par le backend (INPUT, DIGITAL_INPUT, TEXTAREA,
   * RADIO_BUTTON, SWITCH, CHECKBOX, EMAIL, SELECT, DATE) vers les types HTML du template.
   */
  private normalizeInputType(rawType: string | null | undefined): string {
    const t = (rawType || '').toLowerCase();

    switch (t) {
      case 'digital_input':
        return 'number';
      case 'date':
        return 'date';
      case 'switch':
      case 'checkbox':
        return 'checkbox';
      case 'select':
        return 'select';
      case 'radio_button':
        return 'radio';
      case 'textarea':
        return 'textarea';
      case 'email':
        return 'email';
      case 'input':
      case '':
        return 'text';
      default:
        return 'text';
    }
  }

  getMultipleChoiceOptions(field: IDetailRessource): string[] {
    const raw: any = field.multipleChoiceOption;
    if (!raw) return [];
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map((v: string) => v.trim())
        .filter((v: string) => v.length > 0);
    }
    if (Array.isArray(raw)) {
      return raw.map((opt: any) => (typeof opt === 'string' ? opt : opt.value ?? opt.label ?? Object.values(opt)[0]));
    }
    return [];
  }

  validateDetailRessourceForm(): boolean {
    this.validationDetailRessourceErrors = {};
    let isValid = true;

    for (const field of this.detailRessourceFields) {
      if (!field.code || !field.required) continue;
      const val = this.detailRessourceValues[field.code];
      const isEmpty = val === null || val === undefined || val === '';
      if (isEmpty) {
        this.validationDetailRessourceErrors[field.code] = `${field.label || field.code} est obligatoire`;
        isValid = false;
      }
    }

    return isValid;
  }

  private buildAdditionalInfoPayload(): Array<Record<string, string>> | null {
    if (this.detailRessourceFields.length === 0) {
      return null;
    }

    return this.detailRessourceFields
      .filter(f => !!f.code)
      .map(f => ({
        code: f.code as string,
        label: f.label ?? '',
        inputType: f.inputType ?? 'text',
        value: this.formatDetailRessourceValue(this.detailRessourceValues[f.code as string]),
      }));
  }

  private formatDetailRessourceValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    if (!this.validateDetailRessourceForm()) {
      return;
    }

    this.isSaving = true;
    const ressource = this.ressourceFormService.getRessource(this.editForm);
    ressource.additionalInfo = this.buildAdditionalInfoPayload();

    if (ressource.id !== null) {
      this.subscribeToSaveResponse(this.ressourceService.update(ressource));
    } else {
      this.subscribeToSaveResponse(this.ressourceService.create(ressource));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRessource>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: response => this.onSaveSuccess(response),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(response: HttpResponse<IRessource>): void {
    const saved = response.body;
    if (saved && saved.id !== null && saved.id !== undefined) {
      this.router.navigate(['/ressource', saved.id, 'edit'], { replaceUrl: true }).then(() => {
        this.updateForm(saved);
        if (saved.typeRessourceId) {
          this.loadDetailRessourceFields(saved.typeRessourceId);
        }
      });
    }
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  changerStatut(statut: string): void {
    if (!this.ressource?.id) {
      return;
    }
    this.changingStatut = true;
    this.ressourceService.changerStatut(this.ressource.id, statut).subscribe({
      next: res => {
        this.changingStatut = false;
        if (res.body) {
          this.ressource = res.body;
          this.editForm.patchValue({ statut: res.body.statut });
        }
      },
      error: () => {
        this.changingStatut = false;
      },
    });
  }

  protected updateForm(ressource: IRessource): void {
    this.ressource = ressource;
    this.ressourceFormService.resetForm(this.editForm, ressource);
  }
}
