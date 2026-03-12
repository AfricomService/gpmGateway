import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../facture-wo.test-samples';

import { FactureWOFormService } from './facture-wo-form.service';

describe('FactureWO Form Service', () => {
  let service: FactureWOFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FactureWOFormService);
  });

  describe('Service methods', () => {
    describe('createFactureWOFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFactureWOFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            pourcentageFacture: expect.any(Object),
            montantFacture: expect.any(Object),
            remarque: expect.any(Object),
            workOrderId: expect.any(Object),
            facture: expect.any(Object),
          })
        );
      });

      it('passing IFactureWO should create a new form with FormGroup', () => {
        const formGroup = service.createFactureWOFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            pourcentageFacture: expect.any(Object),
            montantFacture: expect.any(Object),
            remarque: expect.any(Object),
            workOrderId: expect.any(Object),
            facture: expect.any(Object),
          })
        );
      });
    });

    describe('getFactureWO', () => {
      it('should return NewFactureWO for default FactureWO initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createFactureWOFormGroup(sampleWithNewData);

        const factureWO = service.getFactureWO(formGroup) as any;

        expect(factureWO).toMatchObject(sampleWithNewData);
      });

      it('should return NewFactureWO for empty FactureWO initial value', () => {
        const formGroup = service.createFactureWOFormGroup();

        const factureWO = service.getFactureWO(formGroup) as any;

        expect(factureWO).toMatchObject({});
      });

      it('should return IFactureWO', () => {
        const formGroup = service.createFactureWOFormGroup(sampleWithRequiredData);

        const factureWO = service.getFactureWO(formGroup) as any;

        expect(factureWO).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFactureWO should not enable id FormControl', () => {
        const formGroup = service.createFactureWOFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFactureWO should disable id FormControl', () => {
        const formGroup = service.createFactureWOFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
