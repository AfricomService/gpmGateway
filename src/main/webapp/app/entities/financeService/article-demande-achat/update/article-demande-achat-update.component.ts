import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ArticleDemandeAchatFormService, ArticleDemandeAchatFormGroup } from './article-demande-achat-form.service';
import { IArticleDemandeAchat } from '../article-demande-achat.model';
import { ArticleDemandeAchatService } from '../service/article-demande-achat.service';
import { IDemandeAchat } from 'app/entities/financeService/demande-achat/demande-achat.model';
import { DemandeAchatService } from 'app/entities/financeService/demande-achat/service/demande-achat.service';
import { TypeArticleDemandeAchat } from 'app/entities/enumerations/type-article-demande-achat.model';

@Component({
  selector: 'jhi-article-demande-achat-update',
  templateUrl: './article-demande-achat-update.component.html',
})
export class ArticleDemandeAchatUpdateComponent implements OnInit {
  isSaving = false;
  articleDemandeAchat: IArticleDemandeAchat | null = null;
  typeArticleDemandeAchatValues = Object.keys(TypeArticleDemandeAchat);

  demandeAchatsSharedCollection: IDemandeAchat[] = [];

  editForm: ArticleDemandeAchatFormGroup = this.articleDemandeAchatFormService.createArticleDemandeAchatFormGroup();

  constructor(
    protected articleDemandeAchatService: ArticleDemandeAchatService,
    protected articleDemandeAchatFormService: ArticleDemandeAchatFormService,
    protected demandeAchatService: DemandeAchatService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareDemandeAchat = (o1: IDemandeAchat | null, o2: IDemandeAchat | null): boolean =>
    this.demandeAchatService.compareDemandeAchat(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ articleDemandeAchat }) => {
      this.articleDemandeAchat = articleDemandeAchat;
      if (articleDemandeAchat) {
        this.updateForm(articleDemandeAchat);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const articleDemandeAchat = this.articleDemandeAchatFormService.getArticleDemandeAchat(this.editForm);
    if (articleDemandeAchat.id !== null) {
      this.subscribeToSaveResponse(this.articleDemandeAchatService.update(articleDemandeAchat));
    } else {
      this.subscribeToSaveResponse(this.articleDemandeAchatService.create(articleDemandeAchat));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IArticleDemandeAchat>>): void {
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

  protected updateForm(articleDemandeAchat: IArticleDemandeAchat): void {
    this.articleDemandeAchat = articleDemandeAchat;
    this.articleDemandeAchatFormService.resetForm(this.editForm, articleDemandeAchat);

    this.demandeAchatsSharedCollection = this.demandeAchatService.addDemandeAchatToCollectionIfMissing<IDemandeAchat>(
      this.demandeAchatsSharedCollection,
      articleDemandeAchat.demandeAchat
    );
  }

  protected loadRelationshipsOptions(): void {
    this.demandeAchatService
      .query()
      .pipe(map((res: HttpResponse<IDemandeAchat[]>) => res.body ?? []))
      .pipe(
        map((demandeAchats: IDemandeAchat[]) =>
          this.demandeAchatService.addDemandeAchatToCollectionIfMissing<IDemandeAchat>(
            demandeAchats,
            this.articleDemandeAchat?.demandeAchat
          )
        )
      )
      .subscribe((demandeAchats: IDemandeAchat[]) => (this.demandeAchatsSharedCollection = demandeAchats));
  }
}
