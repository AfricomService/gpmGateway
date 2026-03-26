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
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { IArticle } from 'app/entities/projectService/article/article.model';
import { ArticleService } from 'app/entities/projectService/article/service/article.service';
import { IMatriceFacturation } from 'app/entities/projectService/matrice-facturation/matrice-facturation.model';
import { MatriceFacturationService } from 'app/entities/projectService/matrice-facturation/service/matrice-facturation.service';

@Component({
  selector: 'jhi-affaire-update',
  templateUrl: './affaire-update.component.html',
})
export class AffaireUpdateComponent implements OnInit {
  isSaving = false;
  affaire: IAffaire | null = null;
  statutAffaireValues = Object.keys(StatutAffaire);

  clientsSharedCollection: IClient[] = [];
  usersSharedCollection: IUser[] = [];
  selectedResponsable: IUser | null = null;

  allArticles: IArticle[] = [];
  selectedArticles: IArticle[] = [];

  allMatrices: IMatriceFacturation[] = [];
  selectedMatrices: IMatriceFacturation[] = [];

  editForm: AffaireFormGroup = this.affaireFormService.createAffaireFormGroup();

  constructor(
    protected affaireService: AffaireService,
    protected affaireFormService: AffaireFormService,
    protected clientService: ClientService,
    protected userService: UserService,
    protected articleService: ArticleService,
    protected matriceFacturationService: MatriceFacturationService,
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

    if (this.selectedResponsable) {
      this.editForm.patchValue({
        responsableProjetId: this.selectedResponsable.id,
        responsableProjetUserLogin: this.selectedResponsable.login,
      });
    }

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

    if (affaire.responsableProjetId && affaire.responsableProjetUserLogin) {
      this.selectedResponsable = {
        id: affaire.responsableProjetId,
        login: affaire.responsableProjetUserLogin,
      };
    }

    this.clientsSharedCollection = this.clientService.addClientToCollectionIfMissing<IClient>(this.clientsSharedCollection, affaire.client);
  }

  protected loadRelationshipsOptions(): void {
    this.clientService
      .query()
      .pipe(map((res: HttpResponse<IClient[]>) => res.body ?? []))
      .pipe(map((clients: IClient[]) => this.clientService.addClientToCollectionIfMissing<IClient>(clients, this.affaire?.client)))
      .subscribe((clients: IClient[]) => (this.clientsSharedCollection = clients));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .subscribe((users: IUser[]) => {
        this.usersSharedCollection = users;
        if (this.selectedResponsable && !this.usersSharedCollection.find(u => u.id === this.selectedResponsable?.id)) {
          this.usersSharedCollection = [this.selectedResponsable, ...this.usersSharedCollection];
        }
      });

    this.articleService
      .query()
      .pipe(map((res: HttpResponse<IArticle[]>) => res.body ?? []))
      .subscribe((articles: IArticle[]) => {
        this.allArticles = articles;
      });

    this.matriceFacturationService
      .query()
      .pipe(map((res: HttpResponse<IMatriceFacturation[]>) => res.body ?? []))
      .subscribe((matrices: IMatriceFacturation[]) => {
        this.allMatrices = matrices;
      });
  }

  toggleArticleSelection(article: IArticle): void {
    const index = this.selectedArticles.findIndex(a => a.id === article.id);
    if (index > -1) {
      this.selectedArticles.splice(index, 1);
    } else {
      this.selectedArticles.push(article);
    }
  }

  isArticleSelected(article: IArticle): boolean {
    return this.selectedArticles.findIndex(a => a.id === article.id) > -1;
  }

  toggleMatriceSelection(matrice: IMatriceFacturation): void {
    const index = this.selectedMatrices.findIndex(m => m.id === matrice.id);
    if (index > -1) {
      this.selectedMatrices.splice(index, 1);
    } else {
      this.selectedMatrices.push(matrice);
    }
  }

  isMatriceSelected(matrice: IMatriceFacturation): boolean {
    return this.selectedMatrices.findIndex(m => m.id === matrice.id) > -1;
  }
}
