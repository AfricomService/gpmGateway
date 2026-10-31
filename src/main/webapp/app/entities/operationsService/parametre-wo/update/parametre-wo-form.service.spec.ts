import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../parametre-wo.test-samples';

import { ParametreWOFormService } from './parametre-wo-form.service';

describe('ParametreWO Form Service', () => {
  let service: ParametreWOFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParametreWOFormService);
  });

  describe('Service methods', () => {
    describe('createParametreWOFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createParametreWOFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nom: expect.any(Object),
            description: expect.any(Object),
          })
        );
      });

      it('passing IParametreWO should create a new form with FormGroup', () => {
        const formGroup = service.createParametreWOFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nom: expect.any(Object),
            description: expect.any(Object),
          })
        );
      });
    });

    describe('getParametreWO', () => {
      it('should return NewParametreWO for default ParametreWO initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createParametreWOFormGroup(sampleWithNewData);

        const parametreWO = service.getParametreWO(formGroup) as any;

        expect(parametreWO).toMatchObject(sampleWithNewData);
      });

      it('should return NewParametreWO for empty ParametreWO initial value', () => {
        const formGroup = service.createParametreWOFormGroup();

        const parametreWO = service.getParametreWO(formGroup) as any;

        expect(parametreWO).toMatchObject({});
      });

      it('should return IParametreWO', () => {
        const formGroup = service.createParametreWOFormGroup(sampleWithRequiredData);

        const parametreWO = service.getParametreWO(formGroup) as any;

        expect(parametreWO).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IParametreWO should not enable id FormControl', () => {
        const formGroup = service.createParametreWOFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewParametreWO should disable id FormControl', () => {
        const formGroup = service.createParametreWOFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
