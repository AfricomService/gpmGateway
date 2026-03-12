import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { AffaireArticleFormService, AffaireArticleFormGroup } from './affaire-article-form.service';
import { IAffaireArticle } from '../affaire-article.model';
import { AffaireArticleService } from '../service/affaire-article.service';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IArticle } from 'app/entities/projectService/article/article.model';
import { ArticleService } from 'app/entities/projectService/article/service/article.service';

@Component({
  selector: 'jhi-affaire-article-update',
  templateUrl: './affaire-article-update.component.html',
})
export class AffaireArticleUpdateComponent implements OnInit {
  isSaving = false;
  affaireArticle: IAffaireArticle | null = null;

  affairesSharedCollection: IAffaire[] = [];
  articlesSharedCollection: IArticle[] = [];

  editForm: AffaireArticleFormGroup = this.affaireArticleFormService.createAffaireArticleFormGroup();

  constructor(
    protected affaireArticleService: AffaireArticleService,
    protected affaireArticleFormService: AffaireArticleFormService,
    protected affaireService: AffaireService,
    protected articleService: ArticleService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareAffaire = (o1: IAffaire | null, o2: IAffaire | null): boolean => this.affaireService.compareAffaire(o1, o2);

  compareArticle = (o1: IArticle | null, o2: IArticle | null): boolean => this.articleService.compareArticle(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ affaireArticle }) => {
      this.affaireArticle = affaireArticle;
      if (affaireArticle) {
        this.updateForm(affaireArticle);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const affaireArticle = this.affaireArticleFormService.getAffaireArticle(this.editForm);
    if (affaireArticle.id !== null) {
      this.subscribeToSaveResponse(this.affaireArticleService.update(affaireArticle));
    } else {
      this.subscribeToSaveResponse(this.affaireArticleService.create(affaireArticle));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAffaireArticle>>): void {
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

  protected updateForm(affaireArticle: IAffaireArticle): void {
    this.affaireArticle = affaireArticle;
    this.affaireArticleFormService.resetForm(this.editForm, affaireArticle);

    this.affairesSharedCollection = this.affaireService.addAffaireToCollectionIfMissing<IAffaire>(
      this.affairesSharedCollection,
      affaireArticle.affaire
    );
    this.articlesSharedCollection = this.articleService.addArticleToCollectionIfMissing<IArticle>(
      this.articlesSharedCollection,
      affaireArticle.article
    );
  }

  protected loadRelationshipsOptions(): void {
    this.affaireService
      .query()
      .pipe(map((res: HttpResponse<IAffaire[]>) => res.body ?? []))
      .pipe(
        map((affaires: IAffaire[]) => this.affaireService.addAffaireToCollectionIfMissing<IAffaire>(affaires, this.affaireArticle?.affaire))
      )
      .subscribe((affaires: IAffaire[]) => (this.affairesSharedCollection = affaires));

    this.articleService
      .query()
      .pipe(map((res: HttpResponse<IArticle[]>) => res.body ?? []))
      .pipe(
        map((articles: IArticle[]) => this.articleService.addArticleToCollectionIfMissing<IArticle>(articles, this.affaireArticle?.article))
      )
      .subscribe((articles: IArticle[]) => (this.articlesSharedCollection = articles));
  }
}
