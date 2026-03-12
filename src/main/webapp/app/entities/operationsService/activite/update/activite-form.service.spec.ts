import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../activite.test-samples';

import { ActiviteFormService } from './activite-form.service';

describe('Activite Form Service', () => {
  let service: ActiviteFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiviteFormService);
  });

  describe('Service methods', () => {
    describe('createActiviteFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createActiviteFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            designation: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });

      it('passing IActivite should create a new form with FormGroup', () => {
        const formGroup = service.createActiviteFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            designation: expect.any(Object),
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

    describe('getActivite', () => {
      it('should return NewActivite for default Activite initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createActiviteFormGroup(sampleWithNewData);

        const activite = service.getActivite(formGroup) as any;

        expect(activite).toMatchObject(sampleWithNewData);
      });

      it('should return NewActivite for empty Activite initial value', () => {
        const formGroup = service.createActiviteFormGroup();

        const activite = service.getActivite(formGroup) as any;

        expect(activite).toMatchObject({});
      });

      it('should return IActivite', () => {
        const formGroup = service.createActiviteFormGroup(sampleWithRequiredData);

        const activite = service.getActivite(formGroup) as any;

        expect(activite).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IActivite should not enable id FormControl', () => {
        const formGroup = service.createActiviteFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewActivite should disable id FormControl', () => {
        const formGroup = service.createActiviteFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
