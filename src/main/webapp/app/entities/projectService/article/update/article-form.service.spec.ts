import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../article.test-samples';

import { ArticleFormService } from './article-form.service';

describe('Article Form Service', () => {
  let service: ArticleFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleFormService);
  });

  describe('Service methods', () => {
    describe('createArticleFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createArticleFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            designation: expect.any(Object),
            uniteMesure: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });

      it('passing IArticle should create a new form with FormGroup', () => {
        const formGroup = service.createArticleFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            designation: expect.any(Object),
            uniteMesure: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });
    });

    describe('getArticle', () => {
      it('should return NewArticle for default Article initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createArticleFormGroup(sampleWithNewData);

        const article = service.getArticle(formGroup) as any;

        expect(article).toMatchObject(sampleWithNewData);
      });

      it('should return NewArticle for empty Article initial value', () => {
        const formGroup = service.createArticleFormGroup();

        const article = service.getArticle(formGroup) as any;

        expect(article).toMatchObject({});
      });

      it('should return IArticle', () => {
        const formGroup = service.createArticleFormGroup(sampleWithRequiredData);

        const article = service.getArticle(formGroup) as any;

        expect(article).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IArticle should not enable id FormControl', () => {
        const formGroup = service.createArticleFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewArticle should disable id FormControl', () => {
        const formGroup = service.createArticleFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
