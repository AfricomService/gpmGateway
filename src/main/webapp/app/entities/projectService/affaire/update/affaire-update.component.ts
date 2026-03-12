import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { AffaireFormService, AffaireFormGroup } from './affaire-form.service';
import { IAffaire } from '../affaire.model';
import { AffaireService } from '../service/affaire.service';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';
import { StatutAffaire } from 'app/entities/enumerations/statut-affaire.model';

@Component({
  selector: 'jhi-affaire-update',
  templateUrl: './affaire-update.component.html',
})
export class AffaireUpdateComponent implements OnInit {
  isSaving = false;
  affaire: IAffaire | null = null;
  statutAffaireValues = Object.keys(StatutAffaire);

  clientsSharedCollection: IClient[] = [];

  editForm: AffaireFormGroup = this.affaireFormService.createAffaireFormGroup();

  constructor(
    protected affaireService: AffaireService,
    protected affaireFormService: AffaireFormService,
    protected clientService: ClientService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareClient = (o1: IClient | null, o2: IClient | null): boolean => this.clientService.compareClient(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ affaire }) => {
      this.affaire = affaire;
      if (affaire) {
        this.updateForm(affaire);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const affaire = this.affaireFormService.getAffaire(this.editForm);
    if (affaire.id !== null) {
      this.subscribeToSaveResponse(this.affaireService.update(affaire));
    } else {
      this.subscribeToSaveResponse(this.affaireService.create(affaire));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAffaire>>): void {
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

  protected updateForm(affaire: IAffaire): void {
    this.affaire = affaire;
    this.affaireFormService.resetForm(this.editForm, affaire);

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, affaire.client);
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.affaire?.client)))
      .subscribe((clients: IClient[]) => (this.clientsSharedCollection = clients));
  }
}
