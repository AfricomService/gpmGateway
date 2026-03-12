import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../devis.test-samples';

import { DevisFormService } from './devis-form.service';

describe('Devis Form Service', () => {
  let service: DevisFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevisFormService);
  });

  describe('Service methods', () => {
    describe('createDevisFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDevisFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            reference: expect.any(Object),
            montant: expect.any(Object),
            date: expect.any(Object),
            statut: expect.any(Object),
            workOrderId: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
            facture: expect.any(Object),
          })
        );
      });

      it('passing IDevis should create a new form with FormGroup', () => {
        const formGroup = service.createDevisFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            reference: expect.any(Object),
            montant: expect.any(Object),
            date: expect.any(Object),
            statut: expect.any(Object),
            workOrderId: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
            facture: expect.any(Object),
          })
        );
      });
    });

    describe('getDevis', () => {
      it('should return NewDevis for default Devis initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createDevisFormGroup(sampleWithNewData);

        const devis = service.getDevis(formGroup) as any;

        expect(devis).toMatchObject(sampleWithNewData);
      });

      it('should return NewDevis for empty Devis initial value', () => {
        const formGroup = service.createDevisFormGroup();

        const devis = service.getDevis(formGroup) as any;

        expect(devis).toMatchObject({});
      });

      it('should return IDevis', () => {
        const formGroup = service.createDevisFormGroup(sampleWithRequiredData);

        const devis = service.getDevis(formGroup) as any;

        expect(devis).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDevis should not enable id FormControl', () => {
        const formGroup = service.createDevisFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDevis should disable id FormControl', () => {
        const formGroup = service.createDevisFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
