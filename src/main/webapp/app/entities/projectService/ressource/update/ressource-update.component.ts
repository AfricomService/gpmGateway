import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { RessourceFormService, RessourceFormGroup } from './ressource-form.service';
import { IRessource } from '../ressource.model';
import { RessourceService } from '../service/ressource.service';
import { ITypeRessource } from 'app/entities/projectService/type-ressource/type-ressource.model';
import { TypeRessourceService } from 'app/entities/projectService/type-ressource/service/type-ressource.service';

type AccordionSection = 'general' | 'maintenance';

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

  constructor(
    protected ressourceService: RessourceService,
    protected ressourceFormService: RessourceFormService,
    protected activatedRoute: ActivatedRoute,
    protected typeRessourceService: TypeRessourceService
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

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const ressource = this.ressourceFormService.getRessource(this.editForm);
    if (ressource.id !== null) {
      this.subscribeToSaveResponse(this.ressourceService.update(ressource));
    } else {
      this.subscribeToSaveResponse(this.ressourceService.create(ressource));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRessource>>): void {
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

  protected updateForm(ressource: IRessource): void {
    this.ressource = ressource;
    this.ressourceFormService.resetForm(this.editForm, ressource);
  }
}
