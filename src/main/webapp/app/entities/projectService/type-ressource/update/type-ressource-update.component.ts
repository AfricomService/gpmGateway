import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { TypeRessourceFormService, TypeRessourceFormGroup } from './type-ressource-form.service';
import { ITypeRessource } from '../type-ressource.model';
import { TypeRessourceService } from '../service/type-ressource.service';
import { IDetailRessource } from 'app/entities/projectService/detail-ressource/detail-ressource.model';
import { DetailRessourceService } from 'app/entities/projectService/detail-ressource/service/detail-ressource.service';

type AccordionSection = 'general' | 'details';

@Component({
  selector: 'jhi-type-ressource-update',
  templateUrl: './type-ressource-update.component.html',
  styleUrls: ['./type-ressource-update.component.scss'],
})
export class TypeRessourceUpdateComponent implements OnInit {
  isSaving = false;
  typeRessource: ITypeRessource | null = null;

  editForm: TypeRessourceFormGroup = this.typeRessourceFormService.createTypeRessourceFormGroup();

  // === Gestion de l'accordéon ===
  openSections: Set<AccordionSection> = new Set(['general', 'details']);

  // === Affectation DetailRessource ===
  availableDetails: IDetailRessource[] = [];
  selectedDetailIds: Set<number> = new Set<number>();
  isLoadingDetails = false;

  constructor(
    protected typeRessourceService: TypeRessourceService,
    protected typeRessourceFormService: TypeRessourceFormService,
    protected detailRessourceService: DetailRessourceService,
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

  // === Sélection des détails ===
  isDetailSelected(detailId: number): boolean {
    return this.selectedDetailIds.has(detailId);
  }

  toggleDetail(detailId: number): void {
    if (this.selectedDetailIds.has(detailId)) {
      this.selectedDetailIds.delete(detailId);
    } else {
      this.selectedDetailIds.add(detailId);
    }
  }

  ngOnInit(): void {
    this.loadAvailableDetails();

    this.activatedRoute.data.subscribe(({ typeRessource }) => {
      this.typeRessource = typeRessource;
      if (typeRessource) {
        this.updateForm(typeRessource);
        this.loadAssignedDetails(typeRessource.id);
      }
    });
  }

  protected loadAvailableDetails(): void {
    this.detailRessourceService.query().subscribe({
      next: (res: HttpResponse<IDetailRessource[]>) => {
        this.availableDetails = res.body ?? [];
      },
    });
  }

  protected loadAssignedDetails(typeRessourceId: number): void {
    this.isLoadingDetails = true;
    this.typeRessourceService
      .findDetails(typeRessourceId)
      .pipe(finalize(() => (this.isLoadingDetails = false)))
      .subscribe({
        next: (res: HttpResponse<IDetailRessource[]>) => {
          this.selectedDetailIds = new Set((res.body ?? []).map(detail => detail.id));
        },
      });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const typeRessource = this.typeRessourceFormService.getTypeRessource(this.editForm);
    if (typeRessource.id !== null) {
      this.subscribeToSaveResponse(this.typeRessourceService.update(typeRessource));
    } else {
      this.subscribeToSaveResponse(this.typeRessourceService.create(typeRessource));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITypeRessource>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: response => this.onSaveSuccess(response),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(response?: HttpResponse<ITypeRessource>): void {
    const savedId = response?.body?.id ?? this.typeRessource?.id;
    if (savedId != null) {
      this.typeRessourceService.replaceDetails(savedId, Array.from(this.selectedDetailIds)).subscribe({
        next: () => this.previousState(),
        error: () => this.previousState(),
      });
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

  protected updateForm(typeRessource: ITypeRessource): void {
    this.typeRessource = typeRessource;
    this.typeRessourceFormService.resetForm(this.editForm, typeRessource);
  }
}
