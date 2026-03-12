import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../article-mission.test-samples';

import { ArticleMissionFormService } from './article-mission-form.service';

describe('ArticleMission Form Service', () => {
  let service: ArticleMissionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleMissionFormService);
  });

  describe('Service methods', () => {
    describe('createArticleMissionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createArticleMissionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            item: expect.any(Object),
            quantitePlanifiee: expect.any(Object),
            quantiteRealisee: expect.any(Object),
            articleCode: expect.any(Object),
            workOrder: expect.any(Object),
          })
        );
      });

      it('passing IArticleMission should create a new form with FormGroup', () => {
        const formGroup = service.createArticleMissionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            item: expect.any(Object),
            quantitePlanifiee: expect.any(Object),
            quantiteRealisee: expect.any(Object),
            articleCode: expect.any(Object),
            workOrder: expect.any(Object),
          })
        );
      });
    });

    describe('getArticleMission', () => {
      it('should return NewArticleMission for default ArticleMission initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createArticleMissionFormGroup(sampleWithNewData);

        const articleMission = service.getArticleMission(formGroup) as any;

        expect(articleMission).toMatchObject(sampleWithNewData);
      });

      it('should return NewArticleMission for empty ArticleMission initial value', () => {
        const formGroup = service.createArticleMissionFormGroup();

        const articleMission = service.getArticleMission(formGroup) as any;

        expect(articleMission).toMatchObject({});
      });

      it('should return IArticleMission', () => {
        const formGroup = service.createArticleMissionFormGroup(sampleWithRequiredData);

        const articleMission = service.getArticleMission(formGroup) as any;

        expect(articleMission).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IArticleMission should not enable id FormControl', () => {
        const formGroup = service.createArticleMissionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewArticleMission should disable id FormControl', () => {
        const formGroup = service.createArticleMissionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
