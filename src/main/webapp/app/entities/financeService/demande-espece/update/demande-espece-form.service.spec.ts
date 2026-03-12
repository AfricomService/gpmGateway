import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../demande-espece.test-samples';

import { DemandeEspeceFormService } from './demande-espece-form.service';

describe('DemandeEspece Form Service', () => {
  let service: DemandeEspeceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeEspeceFormService);
  });

  describe('Service methods', () => {
    describe('createDemandeEspeceFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDemandeEspeceFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            montant: expect.any(Object),
            motif: expect.any(Object),
            workOrderId: expect.any(Object),
            beneficiaireId: expect.any(Object),
            beneficiaireUserLogin: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });

      it('passing IDemandeEspece should create a new form with FormGroup', () => {
        const formGroup = service.createDemandeEspeceFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            montant: expect.any(Object),
            motif: expect.any(Object),
            workOrderId: expect.any(Object),
            beneficiaireId: expect.any(Object),
            beneficiaireUserLogin: expect.any(Object),
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

    describe('getDemandeEspece', () => {
      it('should return NewDemandeEspece for default DemandeEspece initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createDemandeEspeceFormGroup(sampleWithNewData);

        const demandeEspece = service.getDemandeEspece(formGroup) as any;

        expect(demandeEspece).toMatchObject(sampleWithNewData);
      });

      it('should return NewDemandeEspece for empty DemandeEspece initial value', () => {
        const formGroup = service.createDemandeEspeceFormGroup();

        const demandeEspece = service.getDemandeEspece(formGroup) as any;

        expect(demandeEspece).toMatchObject({});
      });

      it('should return IDemandeEspece', () => {
        const formGroup = service.createDemandeEspeceFormGroup(sampleWithRequiredData);

        const demandeEspece = service.getDemandeEspece(formGroup) as any;

        expect(demandeEspece).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDemandeEspece should not enable id FormControl', () => {
        const formGroup = service.createDemandeEspeceFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDemandeEspece should disable id FormControl', () => {
        const formGroup = service.createDemandeEspeceFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
