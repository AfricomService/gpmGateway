import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ArticleDemandeAchatFormService } from './article-demande-achat-form.service';
import { ArticleDemandeAchatService } from '../service/article-demande-achat.service';
import { IArticleDemandeAchat } from '../article-demande-achat.model';
import { IDemandeAchat } from 'app/entities/financeService/demande-achat/demande-achat.model';
import { DemandeAchatService } from 'app/entities/financeService/demande-achat/service/demande-achat.service';

import { ArticleDemandeAchatUpdateComponent } from './article-demande-achat-update.component';

describe('ArticleDemandeAchat Management Update Component', () => {
  let comp: ArticleDemandeAchatUpdateComponent;
  let fixture: ComponentFixture<ArticleDemandeAchatUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let articleDemandeAchatFormService: ArticleDemandeAchatFormService;
  let articleDemandeAchatService: ArticleDemandeAchatService;
  let demandeAchatService: DemandeAchatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ArticleDemandeAchatUpdateComponent],
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
      .overrideTemplate(ArticleDemandeAchatUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ArticleDemandeAchatUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    articleDemandeAchatFormService = TestBed.inject(ArticleDemandeAchatFormService);
    articleDemandeAchatService = TestBed.inject(ArticleDemandeAchatService);
    demandeAchatService = TestBed.inject(DemandeAchatService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call DemandeAchat query and add missing value', () => {
      const articleDemandeAchat: IArticleDemandeAchat = { id: 456 };
      const demandeAchat: IDemandeAchat = { id: 81780 };
      articleDemandeAchat.demandeAchat = demandeAchat;

      const demandeAchatCollection: IDemandeAchat[] = [{ id: 32471 }];
      jest.spyOn(demandeAchatService, 'query').mockReturnValue(of(new HttpResponse({ body: demandeAchatCollection })));
      const additionalDemandeAchats = [demandeAchat];
      const expectedCollection: IDemandeAchat[] = [...additionalDemandeAchats, ...demandeAchatCollection];
      jest.spyOn(demandeAchatService, 'addDemandeAchatToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ articleDemandeAchat });
      comp.ngOnInit();

      expect(demandeAchatService.query).toHaveBeenCalled();
      expect(demandeAchatService.addDemandeAchatToCollectionIfMissing).toHaveBeenCalledWith(
        demandeAchatCollection,
        ...additionalDemandeAchats.map(expect.objectContaining)
      );
      expect(comp.demandeAchatsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const articleDemandeAchat: IArticleDemandeAchat = { id: 456 };
      const demandeAchat: IDemandeAchat = { id: 50329 };
      articleDemandeAchat.demandeAchat = demandeAchat;

      activatedRoute.data = of({ articleDemandeAchat });
      comp.ngOnInit();

      expect(comp.demandeAchatsSharedCollection).toContain(demandeAchat);
      expect(comp.articleDemandeAchat).toEqual(articleDemandeAchat);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IArticleDemandeAchat>>();
      const articleDemandeAchat = { id: 123 };
      jest.spyOn(articleDemandeAchatFormService, 'getArticleDemandeAchat').mockReturnValue(articleDemandeAchat);
      jest.spyOn(articleDemandeAchatService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ articleDemandeAchat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: articleDemandeAchat }));
      saveSubject.complete();

      // THEN
      expect(articleDemandeAchatFormService.getArticleDemandeAchat).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(articleDemandeAchatService.update).toHaveBeenCalledWith(expect.objectContaining(articleDemandeAchat));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IArticleDemandeAchat>>();
      const articleDemandeAchat = { id: 123 };
      jest.spyOn(articleDemandeAchatFormService, 'getArticleDemandeAchat').mockReturnValue({ id: null });
      jest.spyOn(articleDemandeAchatService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ articleDemandeAchat: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: articleDemandeAchat }));
      saveSubject.complete();

      // THEN
      expect(articleDemandeAchatFormService.getArticleDemandeAchat).toHaveBeenCalled();
      expect(articleDemandeAchatService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IArticleDemandeAchat>>();
      const articleDemandeAchat = { id: 123 };
      jest.spyOn(articleDemandeAchatService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ articleDemandeAchat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(articleDemandeAchatService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareDemandeAchat', () => {
      it('Should forward to demandeAchatService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(demandeAchatService, 'compareDemandeAchat');
        comp.compareDemandeAchat(entity, entity2);
        expect(demandeAchatService.compareDemandeAchat).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
