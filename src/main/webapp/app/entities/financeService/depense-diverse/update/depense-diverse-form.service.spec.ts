import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../depense-diverse.test-samples';

import { DepenseDiverseFormService } from './depense-diverse-form.service';

describe('DepenseDiverse Form Service', () => {
  let service: DepenseDiverseFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepenseDiverseFormService);
  });

  describe('Service methods', () => {
    describe('createDepenseDiverseFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDepenseDiverseFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            motif: expect.any(Object),
            montant: expect.any(Object),
            date: expect.any(Object),
            justificatif: expect.any(Object),
            workOrderId: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });

      it('passing IDepenseDiverse should create a new form with FormGroup', () => {
        const formGroup = service.createDepenseDiverseFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            motif: expect.any(Object),
            montant: expect.any(Object),
            date: expect.any(Object),
            justificatif: expect.any(Object),
            workOrderId: expect.any(Object),
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

    describe('getDepenseDiverse', () => {
      it('should return NewDepenseDiverse for default DepenseDiverse initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createDepenseDiverseFormGroup(sampleWithNewData);

        const depenseDiverse = service.getDepenseDiverse(formGroup) as any;

        expect(depenseDiverse).toMatchObject(sampleWithNewData);
      });

      it('should return NewDepenseDiverse for empty DepenseDiverse initial value', () => {
        const formGroup = service.createDepenseDiverseFormGroup();

        const depenseDiverse = service.getDepenseDiverse(formGroup) as any;

        expect(depenseDiverse).toMatchObject({});
      });

      it('should return IDepenseDiverse', () => {
        const formGroup = service.createDepenseDiverseFormGroup(sampleWithRequiredData);

        const depenseDiverse = service.getDepenseDiverse(formGroup) as any;

        expect(depenseDiverse).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDepenseDiverse should not enable id FormControl', () => {
        const formGroup = service.createDepenseDiverseFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDepenseDiverse should disable id FormControl', () => {
        const formGroup = service.createDepenseDiverseFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
