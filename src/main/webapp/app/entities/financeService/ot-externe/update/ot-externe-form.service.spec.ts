import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../ot-externe.test-samples';

import { OtExterneFormService } from './ot-externe-form.service';

describe('OtExterne Form Service', () => {
  let service: OtExterneFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtExterneFormService);
  });

  describe('Service methods', () => {
    describe('createOtExterneFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createOtExterneFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            reference: expect.any(Object),
            statut: expect.any(Object),
            affaireId: expect.any(Object),
            clientId: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });

      it('passing IOtExterne should create a new form with FormGroup', () => {
        const formGroup = service.createOtExterneFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            reference: expect.any(Object),
            statut: expect.any(Object),
            affaireId: expect.any(Object),
            clientId: expect.any(Object),
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

    describe('getOtExterne', () => {
      it('should return NewOtExterne for default OtExterne initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createOtExterneFormGroup(sampleWithNewData);

        const otExterne = service.getOtExterne(formGroup) as any;

        expect(otExterne).toMatchObject(sampleWithNewData);
      });

      it('should return NewOtExterne for empty OtExterne initial value', () => {
        const formGroup = service.createOtExterneFormGroup();

        const otExterne = service.getOtExterne(formGroup) as any;

        expect(otExterne).toMatchObject({});
      });

      it('should return IOtExterne', () => {
        const formGroup = service.createOtExterneFormGroup(sampleWithRequiredData);

        const otExterne = service.getOtExterne(formGroup) as any;

        expect(otExterne).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IOtExterne should not enable id FormControl', () => {
        const formGroup = service.createOtExterneFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewOtExterne should disable id FormControl', () => {
        const formGroup = service.createOtExterneFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
