import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ModelPhaseOTFormService, ModelPhaseOTFormGroup } from './model-phase-ot-form.service';
import { IModelPhaseOT } from '../model-phase-ot.model';
import { ModelPhaseOTService } from '../service/model-phase-ot.service';

type AccordionSection = 'general';

@Component({
  selector: 'jhi-model-phase-ot-update',
  templateUrl: './model-phase-ot-update.component.html',
  styleUrls: ['./model-phase-ot-update.component.scss'],
})
export class ModelPhaseOTUpdateComponent implements OnInit {
  isSaving = false;
  modelPhaseOT: IModelPhaseOT | null = null;

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general']);

  editForm: ModelPhaseOTFormGroup = this.modelPhaseOTFormService.createModelPhaseOTFormGroup();

  constructor(
    protected modelPhaseOTService: ModelPhaseOTService,
    protected modelPhaseOTFormService: ModelPhaseOTFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ modelPhaseOT }) => {
      this.modelPhaseOT = modelPhaseOT;
      if (modelPhaseOT) {
        this.updateForm(modelPhaseOT);
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

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const modelPhaseOT = this.modelPhaseOTFormService.getModelPhaseOT(this.editForm);
    if (modelPhaseOT.id !== null) {
      this.subscribeToSaveResponse(this.modelPhaseOTService.update(modelPhaseOT));
    } else {
      this.subscribeToSaveResponse(this.modelPhaseOTService.create(modelPhaseOT));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IModelPhaseOT>>): void {
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

  protected updateForm(modelPhaseOT: IModelPhaseOT): void {
    this.modelPhaseOT = modelPhaseOT;
    this.modelPhaseOTFormService.resetForm(this.editForm, modelPhaseOT);
  }
}
