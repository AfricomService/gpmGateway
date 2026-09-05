import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DetailRessourceFormService, DetailRessourceFormGroup } from './detail-ressource-form.service';
import { IDetailRessource, IDetailRessourceOption } from '../detail-ressource.model';
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
    protected activatedRoute: ActivatedRoute,
    protected router: Router
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
    const payload: IDetailRessourceOption[] = this.options.map(opt => ({ value: opt }));
    this.editForm.patchValue({ multipleChoiceOption: payload });
  }

  protected parseOptionsFromForm(value: IDetailRessourceOption[] | null | undefined): void {
    this.options = value ? value.map(opt => opt.value ?? '').filter(v => v.length > 0) : [];
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
      next: response => this.onSaveSuccess(response),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(response: HttpResponse<IDetailRessource>): void {
    const saved = response.body;
    if (saved && saved.id !== null && saved.id !== undefined) {
      this.router.navigate(['/detail-ressource', saved.id, 'edit'], { replaceUrl: true }).then(() => {
        this.updateForm(saved);
      });
    }
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
