import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../frais-de-mission.test-samples';

import { FraisDeMissionFormService } from './frais-de-mission-form.service';

describe('FraisDeMission Form Service', () => {
  let service: FraisDeMissionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FraisDeMissionFormService);
  });

  describe('Service methods', () => {
    describe('createFraisDeMissionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFraisDeMissionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            dateDebut: expect.any(Object),
            dateFin: expect.any(Object),
            montantTotal: expect.any(Object),
            avanceRecue: expect.any(Object),
            netAPayer: expect.any(Object),
            noteRendement: expect.any(Object),
            noteQualite: expect.any(Object),
            noteConduite: expect.any(Object),
            noteTotale: expect.any(Object),
            bonusExtra: expect.any(Object),
            justificatifBonus: expect.any(Object),
            justificatifModification: expect.any(Object),
            statut: expect.any(Object),
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

      it('passing IFraisDeMission should create a new form with FormGroup', () => {
        const formGroup = service.createFraisDeMissionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            dateDebut: expect.any(Object),
            dateFin: expect.any(Object),
            montantTotal: expect.any(Object),
            avanceRecue: expect.any(Object),
            netAPayer: expect.any(Object),
            noteRendement: expect.any(Object),
            noteQualite: expect.any(Object),
            noteConduite: expect.any(Object),
            noteTotale: expect.any(Object),
            bonusExtra: expect.any(Object),
            justificatifBonus: expect.any(Object),
            justificatifModification: expect.any(Object),
            statut: expect.any(Object),
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

    describe('getFraisDeMission', () => {
      it('should return NewFraisDeMission for default FraisDeMission initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createFraisDeMissionFormGroup(sampleWithNewData);

        const fraisDeMission = service.getFraisDeMission(formGroup) as any;

        expect(fraisDeMission).toMatchObject(sampleWithNewData);
      });

      it('should return NewFraisDeMission for empty FraisDeMission initial value', () => {
        const formGroup = service.createFraisDeMissionFormGroup();

        const fraisDeMission = service.getFraisDeMission(formGroup) as any;

        expect(fraisDeMission).toMatchObject({});
      });

      it('should return IFraisDeMission', () => {
        const formGroup = service.createFraisDeMissionFormGroup(sampleWithRequiredData);

        const fraisDeMission = service.getFraisDeMission(formGroup) as any;

        expect(fraisDeMission).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFraisDeMission should not enable id FormControl', () => {
        const formGroup = service.createFraisDeMissionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFraisDeMission should disable id FormControl', () => {
        const formGroup = service.createFraisDeMissionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
