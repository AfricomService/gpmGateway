import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { AffaireArticleFormService } from './affaire-article-form.service';
import { AffaireArticleService } from '../service/affaire-article.service';
import { IAffaireArticle } from '../affaire-article.model';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IArticle } from 'app/entities/projectService/article/article.model';
import { ArticleService } from 'app/entities/projectService/article/service/article.service';

import { AffaireArticleUpdateComponent } from './affaire-article-update.component';

describe('AffaireArticle Management Update Component', () => {
  let comp: AffaireArticleUpdateComponent;
  let fixture: ComponentFixture<AffaireArticleUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let affaireArticleFormService: AffaireArticleFormService;
  let affaireArticleService: AffaireArticleService;
  let affaireService: AffaireService;
  let articleService: ArticleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [AffaireArticleUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(AffaireArticleUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AffaireArticleUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    affaireArticleFormService = TestBed.inject(AffaireArticleFormService);
    affaireArticleService = TestBed.inject(AffaireArticleService);
    affaireService = TestBed.inject(AffaireService);
    articleService = TestBed.inject(ArticleService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Affaire query and add missing value', () => {
      const affaireArticle: IAffaireArticle = { id: 456 };
      const affaire: IAffaire = { id: 49182 };
      affaireArticle.affaire = affaire;

      const affaireCollection: IAffaire[] = [{ id: 52475 }];
      jest.spyOn(affaireService, 'query').mockReturnValue(of(new HttpResponse({ body: affaireCollection })));
      const additionalAffaires = [affaire];
      const expectedCollection: IAffaire[] = [...additionalAffaires, ...affaireCollection];
      jest.spyOn(affaireService, 'addAffaireToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ affaireArticle });
      comp.ngOnInit();

      expect(affaireService.query).toHaveBeenCalled();
      expect(affaireService.addAffaireToCollectionIfMissing).toHaveBeenCalledWith(
        affaireCollection,
        ...additionalAffaires.map(expect.objectContaining)
      );
      expect(comp.affairesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Article query and add missing value', () => {
      const affaireArticle: IAffaireArticle = { id: 456 };
      const article: IArticle = { id: 67263 };
      affaireArticle.article = article;

      const articleCollection: IArticle[] = [{ id: 82095 }];
      jest.spyOn(articleService, 'query').mockReturnValue(of(new HttpResponse({ body: articleCollection })));
      const additionalArticles = [article];
      const expectedCollection: IArticle[] = [...additionalArticles, ...articleCollection];
      jest.spyOn(articleService, 'addArticleToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ affaireArticle });
      comp.ngOnInit();

      expect(articleService.query).toHaveBeenCalled();
      expect(articleService.addArticleToCollectionIfMissing).toHaveBeenCalledWith(
        articleCollection,
        ...additionalArticles.map(expect.objectContaining)
      );
      expect(comp.articlesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const affaireArticle: IAffaireArticle = { id: 456 };
      const affaire: IAffaire = { id: 44697 };
      affaireArticle.affaire = affaire;
      const article: IArticle = { id: 57261 };
      affaireArticle.article = article;

      activatedRoute.data = of({ affaireArticle });
      comp.ngOnInit();

      expect(comp.affairesSharedCollection).toContain(affaire);
      expect(comp.articlesSharedCollection).toContain(article);
      expect(comp.affaireArticle).toEqual(affaireArticle);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAffaireArticle>>();
      const affaireArticle = { id: 123 };
      jest.spyOn(affaireArticleFormService, 'getAffaireArticle').mockReturnValue(affaireArticle);
      jest.spyOn(affaireArticleService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affaireArticle });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: affaireArticle }));
      saveSubject.complete();

      // THEN
      expect(affaireArticleFormService.getAffaireArticle).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(affaireArticleService.update).toHaveBeenCalledWith(expect.objectContaining(affaireArticle));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAffaireArticle>>();
      const affaireArticle = { id: 123 };
      jest.spyOn(affaireArticleFormService, 'getAffaireArticle').mockReturnValue({ id: null });
      jest.spyOn(affaireArticleService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affaireArticle: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: affaireArticle }));
      saveSubject.complete();

      // THEN
      expect(affaireArticleFormService.getAffaireArticle).toHaveBeenCalled();
      expect(affaireArticleService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAffaireArticle>>();
      const affaireArticle = { id: 123 };
      jest.spyOn(affaireArticleService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affaireArticle });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(affaireArticleService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareAffaire', () => {
      it('Should forward to affaireService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(affaireService, 'compareAffaire');
        comp.compareAffaire(entity, entity2);
        expect(affaireService.compareAffaire).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareArticle', () => {
      it('Should forward to articleService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(articleService, 'compareArticle');
        comp.compareArticle(entity, entity2);
        expect(articleService.compareArticle).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
