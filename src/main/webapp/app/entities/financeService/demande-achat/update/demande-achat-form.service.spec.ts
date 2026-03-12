import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../demande-achat.test-samples';

import { DemandeAchatFormService } from './demande-achat-form.service';

describe('DemandeAchat Form Service', () => {
  let service: DemandeAchatFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeAchatFormService);
  });

  describe('Service methods', () => {
    describe('createDemandeAchatFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDemandeAchatFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            statut: expect.any(Object),
            type: expect.any(Object),
            dateCreation: expect.any(Object),
            dateMiseADisposition: expect.any(Object),
            workOrderId: expect.any(Object),
            affaireId: expect.any(Object),
            demandeurId: expect.any(Object),
            demandeurUserLogin: expect.any(Object),
            validateurId: expect.any(Object),
            validateurUserLogin: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });

      it('passing IDemandeAchat should create a new form with FormGroup', () => {
        const formGroup = service.createDemandeAchatFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            statut: expect.any(Object),
            type: expect.any(Object),
            dateCreation: expect.any(Object),
            dateMiseADisposition: expect.any(Object),
            workOrderId: expect.any(Object),
            affaireId: expect.any(Object),
            demandeurId: expect.any(Object),
            demandeurUserLogin: expect.any(Object),
            validateurId: expect.any(Object),
            validateurUserLogin: expect.any(Object),
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

    describe('getDemandeAchat', () => {
      it('should return NewDemandeAchat for default DemandeAchat initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createDemandeAchatFormGroup(sampleWithNewData);

        const demandeAchat = service.getDemandeAchat(formGroup) as any;

        expect(demandeAchat).toMatchObject(sampleWithNewData);
      });

      it('should return NewDemandeAchat for empty DemandeAchat initial value', () => {
        const formGroup = service.createDemandeAchatFormGroup();

        const demandeAchat = service.getDemandeAchat(formGroup) as any;

        expect(demandeAchat).toMatchObject({});
      });

      it('should return IDemandeAchat', () => {
        const formGroup = service.createDemandeAchatFormGroup(sampleWithRequiredData);

        const demandeAchat = service.getDemandeAchat(formGroup) as any;

        expect(demandeAchat).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDemandeAchat should not enable id FormControl', () => {
        const formGroup = service.createDemandeAchatFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDemandeAchat should disable id FormControl', () => {
        const formGroup = service.createDemandeAchatFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
