import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../agence.test-samples';

import { AgenceFormService } from './agence-form.service';

describe('Agence Form Service', () => {
  let service: AgenceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgenceFormService);
  });

  describe('Service methods', () => {
    describe('createAgenceFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAgenceFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            designation: expect.any(Object),
            adresse: expect.any(Object),
            ville: expect.any(Object),
            pays: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
            societe: expect.any(Object),
          })
        );
      });

      it('passing IAgence should create a new form with FormGroup', () => {
        const formGroup = service.createAgenceFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            designation: expect.any(Object),
            adresse: expect.any(Object),
            ville: expect.any(Object),
            pays: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
            societe: expect.any(Object),
          })
        );
      });
    });

    describe('getAgence', () => {
      it('should return NewAgence for default Agence initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createAgenceFormGroup(sampleWithNewData);

        const agence = service.getAgence(formGroup) as any;

        expect(agence).toMatchObject(sampleWithNewData);
      });

      it('should return NewAgence for empty Agence initial value', () => {
        const formGroup = service.createAgenceFormGroup();

        const agence = service.getAgence(formGroup) as any;

        expect(agence).toMatchObject({});
      });

      it('should return IAgence', () => {
        const formGroup = service.createAgenceFormGroup(sampleWithRequiredData);

        const agence = service.getAgence(formGroup) as any;

        expect(agence).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAgence should not enable id FormControl', () => {
        const formGroup = service.createAgenceFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAgence should disable id FormControl', () => {
        const formGroup = service.createAgenceFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
