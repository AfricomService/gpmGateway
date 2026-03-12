import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../historique-statut-wo.test-samples';

import { HistoriqueStatutWOFormService } from './historique-statut-wo-form.service';

describe('HistoriqueStatutWO Form Service', () => {
  let service: HistoriqueStatutWOFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueStatutWOFormService);
  });

  describe('Service methods', () => {
    describe('createHistoriqueStatutWOFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createHistoriqueStatutWOFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            ancienStatut: expect.any(Object),
            nouveauStatut: expect.any(Object),
            dateChangement: expect.any(Object),
            commentaire: expect.any(Object),
            userId: expect.any(Object),
            userLogin: expect.any(Object),
            workOrder: expect.any(Object),
          })
        );
      });

      it('passing IHistoriqueStatutWO should create a new form with FormGroup', () => {
        const formGroup = service.createHistoriqueStatutWOFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            ancienStatut: expect.any(Object),
            nouveauStatut: expect.any(Object),
            dateChangement: expect.any(Object),
            commentaire: expect.any(Object),
            userId: expect.any(Object),
            userLogin: expect.any(Object),
            workOrder: expect.any(Object),
          })
        );
      });
    });

    describe('getHistoriqueStatutWO', () => {
      it('should return NewHistoriqueStatutWO for default HistoriqueStatutWO initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createHistoriqueStatutWOFormGroup(sampleWithNewData);

        const historiqueStatutWO = service.getHistoriqueStatutWO(formGroup) as any;

        expect(historiqueStatutWO).toMatchObject(sampleWithNewData);
      });

      it('should return NewHistoriqueStatutWO for empty HistoriqueStatutWO initial value', () => {
        const formGroup = service.createHistoriqueStatutWOFormGroup();

        const historiqueStatutWO = service.getHistoriqueStatutWO(formGroup) as any;

        expect(historiqueStatutWO).toMatchObject({});
      });

      it('should return IHistoriqueStatutWO', () => {
        const formGroup = service.createHistoriqueStatutWOFormGroup(sampleWithRequiredData);

        const historiqueStatutWO = service.getHistoriqueStatutWO(formGroup) as any;

        expect(historiqueStatutWO).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IHistoriqueStatutWO should not enable id FormControl', () => {
        const formGroup = service.createHistoriqueStatutWOFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewHistoriqueStatutWO should disable id FormControl', () => {
        const formGroup = service.createHistoriqueStatutWOFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
