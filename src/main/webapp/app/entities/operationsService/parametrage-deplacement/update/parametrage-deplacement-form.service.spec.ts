import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../parametrage-deplacement.test-samples';

import { ParametrageDeplacementFormService } from './parametrage-deplacement-form.service';

describe('ParametrageDeplacement Form Service', () => {
  let service: ParametrageDeplacementFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParametrageDeplacementFormService);
  });

  describe('Service methods', () => {
    describe('createParametrageDeplacementFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createParametrageDeplacementFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            workOrderId: expect.any(Object),
            date: expect.any(Object),
            params: expect.any(Object),
          })
        );
      });

      it('passing IParametrageDeplacement should create a new form with FormGroup', () => {
        const formGroup = service.createParametrageDeplacementFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            workOrderId: expect.any(Object),
            date: expect.any(Object),
            params: expect.any(Object),
          })
        );
      });
    });

    describe('getParametrageDeplacement', () => {
      it('should return NewParametrageDeplacement for default ParametrageDeplacement initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createParametrageDeplacementFormGroup(sampleWithNewData);

        const parametrageDeplacement = service.getParametrageDeplacement(formGroup) as any;

        expect(parametrageDeplacement).toMatchObject(sampleWithNewData);
      });

      it('should return NewParametrageDeplacement for empty ParametrageDeplacement initial value', () => {
        const formGroup = service.createParametrageDeplacementFormGroup();

        const parametrageDeplacement = service.getParametrageDeplacement(formGroup) as any;

        expect(parametrageDeplacement).toMatchObject({});
      });

      it('should return IParametrageDeplacement', () => {
        const formGroup = service.createParametrageDeplacementFormGroup(sampleWithRequiredData);

        const parametrageDeplacement = service.getParametrageDeplacement(formGroup) as any;

        expect(parametrageDeplacement).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IParametrageDeplacement should not enable id FormControl', () => {
        const formGroup = service.createParametrageDeplacementFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewParametrageDeplacement should disable id FormControl', () => {
        const formGroup = service.createParametrageDeplacementFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
