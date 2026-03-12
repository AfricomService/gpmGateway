import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { PieceJointeFormService, PieceJointeFormGroup } from './piece-jointe-form.service';
import { IPieceJointe } from '../piece-jointe.model';
import { PieceJointeService } from '../service/piece-jointe.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';

@Component({
  selector: 'jhi-piece-jointe-update',
  templateUrl: './piece-jointe-update.component.html',
})
export class PieceJointeUpdateComponent implements OnInit {
  isSaving = false;
  pieceJointe: IPieceJointe | null = null;

  affairesSharedCollection: IAffaire[] = [];

  editForm: PieceJointeFormGroup = this.pieceJointeFormService.createPieceJointeFormGroup();

  constructor(
    protected pieceJointeService: PieceJointeService,
    protected pieceJointeFormService: PieceJointeFormService,
    protected affaireService: AffaireService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareAffaire = (o1: IAffaire | null, o2: IAffaire | null): boolean => this.affaireService.compareAffaire(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pieceJointe }) => {
      this.pieceJointe = pieceJointe;
      if (pieceJointe) {
        this.updateForm(pieceJointe);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const pieceJointe = this.pieceJointeFormService.getPieceJointe(this.editForm);
    if (pieceJointe.id !== null) {
      this.subscribeToSaveResponse(this.pieceJointeService.update(pieceJointe));
    } else {
      this.subscribeToSaveResponse(this.pieceJointeService.create(pieceJointe));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPieceJointe>>): void {
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

  protected updateForm(pieceJointe: IPieceJointe): void {
    this.pieceJointe = pieceJointe;
    this.pieceJointeFormService.resetForm(this.editForm, pieceJointe);

    this.affairesSharedCollection = this.affaireService.addAffaireToCollectionIfMissing<IAffaire>(
      this.affairesSharedCollection,
      pieceJointe.affaire
    );
  }

  protected loadRelationshipsOptions(): void {
    this.affaireService
      .query()
      .pipe(map((res: HttpResponse<IAffaire[]>) => res.body ?? []))
      .pipe(
        map((affaires: IAffaire[]) => this.affaireService.addAffaireToCollectionIfMissing<IAffaire>(affaires, this.pieceJointe?.affaire))
      )
      .subscribe((affaires: IAffaire[]) => (this.affairesSharedCollection = affaires));
  }
}
