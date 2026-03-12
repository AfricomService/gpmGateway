import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../article-demande-achat.test-samples';

import { ArticleDemandeAchatFormService } from './article-demande-achat-form.service';

describe('ArticleDemandeAchat Form Service', () => {
  let service: ArticleDemandeAchatFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleDemandeAchatFormService);
  });

  describe('Service methods', () => {
    describe('createArticleDemandeAchatFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createArticleDemandeAchatFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            qteDemandee: expect.any(Object),
            type: expect.any(Object),
            articleCode: expect.any(Object),
            demandeAchat: expect.any(Object),
          })
        );
      });

      it('passing IArticleDemandeAchat should create a new form with FormGroup', () => {
        const formGroup = service.createArticleDemandeAchatFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            qteDemandee: expect.any(Object),
            type: expect.any(Object),
            articleCode: expect.any(Object),
            demandeAchat: expect.any(Object),
          })
        );
      });
    });

    describe('getArticleDemandeAchat', () => {
      it('should return NewArticleDemandeAchat for default ArticleDemandeAchat initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createArticleDemandeAchatFormGroup(sampleWithNewData);

        const articleDemandeAchat = service.getArticleDemandeAchat(formGroup) as any;

        expect(articleDemandeAchat).toMatchObject(sampleWithNewData);
      });

      it('should return NewArticleDemandeAchat for empty ArticleDemandeAchat initial value', () => {
        const formGroup = service.createArticleDemandeAchatFormGroup();

        const articleDemandeAchat = service.getArticleDemandeAchat(formGroup) as any;

        expect(articleDemandeAchat).toMatchObject({});
      });

      it('should return IArticleDemandeAchat', () => {
        const formGroup = service.createArticleDemandeAchatFormGroup(sampleWithRequiredData);

        const articleDemandeAchat = service.getArticleDemandeAchat(formGroup) as any;

        expect(articleDemandeAchat).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IArticleDemandeAchat should not enable id FormControl', () => {
        const formGroup = service.createArticleDemandeAchatFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewArticleDemandeAchat should disable id FormControl', () => {
        const formGroup = service.createArticleDemandeAchatFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
