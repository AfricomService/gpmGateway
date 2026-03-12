import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../affaire-article.test-samples';

import { AffaireArticleFormService } from './affaire-article-form.service';

describe('AffaireArticle Form Service', () => {
  let service: AffaireArticleFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AffaireArticleFormService);
  });

  describe('Service methods', () => {
    describe('createAffaireArticleFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAffaireArticleFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            quantiteContractuelle: expect.any(Object),
            quantiteRealisee: expect.any(Object),
            affaire: expect.any(Object),
            article: expect.any(Object),
          })
        );
      });

      it('passing IAffaireArticle should create a new form with FormGroup', () => {
        const formGroup = service.createAffaireArticleFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            quantiteContractuelle: expect.any(Object),
            quantiteRealisee: expect.any(Object),
            affaire: expect.any(Object),
            article: expect.any(Object),
          })
        );
      });
    });

    describe('getAffaireArticle', () => {
      it('should return NewAffaireArticle for default AffaireArticle initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createAffaireArticleFormGroup(sampleWithNewData);

        const affaireArticle = service.getAffaireArticle(formGroup) as any;

        expect(affaireArticle).toMatchObject(sampleWithNewData);
      });

      it('should return NewAffaireArticle for empty AffaireArticle initial value', () => {
        const formGroup = service.createAffaireArticleFormGroup();

        const affaireArticle = service.getAffaireArticle(formGroup) as any;

        expect(affaireArticle).toMatchObject({});
      });

      it('should return IAffaireArticle', () => {
        const formGroup = service.createAffaireArticleFormGroup(sampleWithRequiredData);

        const affaireArticle = service.getAffaireArticle(formGroup) as any;

        expect(affaireArticle).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAffaireArticle should not enable id FormControl', () => {
        const formGroup = service.createAffaireArticleFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAffaireArticle should disable id FormControl', () => {
        const formGroup = service.createAffaireArticleFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
