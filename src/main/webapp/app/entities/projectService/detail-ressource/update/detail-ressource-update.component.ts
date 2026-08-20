import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DetailRessourceFormService, DetailRessourceFormGroup } from './detail-ressource-form.service';
import { IDetailRessource } from '../detail-ressource.model';
import { DetailRessourceService } from '../service/detail-ressource.service';

type AccordionSection = 'general' | 'config';

@Component({
  selector: 'jhi-detail-ressource-update',
  templateUrl: './detail-ressource-update.component.html',
  styleUrls: ['./detail-ressource-update.component.scss'],
})
export class DetailRessourceUpdateComponent implements OnInit {
  isSaving = false;
  detailRessource: IDetailRessource | null = null;

  editForm: DetailRessourceFormGroup = this.detailRessourceFormService.createDetailRessourceFormGroup();

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general', 'config']);

  // === Types de champ disponibles ===
  inputTypes: { value: string; label: string }[] = [
    { value: 'INPUT', label: 'Input' },
    { value: 'DIGITAL_INPUT', label: 'Digital input' },
    { value: 'TEXTAREA', label: 'TextArea' },
    { value: 'RADIO_BUTTON', label: 'RadioButton' },
    { value: 'SWITCH', label: 'Switch' },
    { value: 'CHECKBOX', label: 'Checkbox' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'SELECT', label: 'Select' },
    { value: 'DATE', label: 'Date' },
  ];

  // === Options (multipleChoiceOption) ===
  options: string[] = [];
  newOption = '';

  constructor(
    protected detailRessourceService: DetailRessourceService,
    protected detailRessourceFormService: DetailRessourceFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

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

  // === Types de champ nécessitant des options ===
  requiresOptions(): boolean {
    const inputType = this.editForm.get('inputType')?.value;
    return inputType === 'SELECT' || inputType === 'RADIO_BUTTON' || inputType === 'CHECKBOX';
  }

  // === Gestion des options (chips) ===
  addOption(): void {
    const value = this.newOption.trim();
    if (value && !this.options.includes(value)) {
      this.options = [...this.options, value];
      this.syncOptionsToForm();
    }
    this.newOption = '';
  }

  removeOption(index: number): void {
    this.options = this.options.filter((_, i) => i !== index);
    this.syncOptionsToForm();
  }

  protected syncOptionsToForm(): void {
    this.editForm.patchValue({ multipleChoiceOption: this.options.join(',') });
  }

  protected parseOptionsFromForm(value: string | null | undefined): void {
    this.options = value
      ? value
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0)
      : [];
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ detailRessource }) => {
      this.detailRessource = detailRessource;
      if (detailRessource) {
        this.updateForm(detailRessource);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const detailRessource = this.detailRessourceFormService.getDetailRessource(this.editForm);
    if (detailRessource.id !== null) {
      this.subscribeToSaveResponse(this.detailRessourceService.update(detailRessource));
    } else {
      this.subscribeToSaveResponse(this.detailRessourceService.create(detailRessource));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDetailRessource>>): void {
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

  protected updateForm(detailRessource: IDetailRessource): void {
    this.detailRessource = detailRessource;
    this.detailRessourceFormService.resetForm(this.editForm, detailRessource);
    this.parseOptionsFromForm(detailRessource.multipleChoiceOption);
  }
}
