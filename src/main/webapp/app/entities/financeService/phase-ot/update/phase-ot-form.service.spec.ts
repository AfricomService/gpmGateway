import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../phase-ot.test-samples';

import { PhaseOtFormService } from './phase-ot-form.service';

describe('PhaseOt Form Service', () => {
  let service: PhaseOtFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhaseOtFormService);
  });

  describe('Service methods', () => {
    describe('createPhaseOtFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPhaseOtFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nom: expect.any(Object),
            description: expect.any(Object),
            duree: expect.any(Object),
            bloquante: expect.any(Object),
            statut: expect.any(Object),
            dateDebut: expect.any(Object),
            dl: expect.any(Object),
            dlc: expect.any(Object),
            phaseParentId: expect.any(Object),
          })
        );
      });

      it('passing IPhaseOt should create a new form with FormGroup', () => {
        const formGroup = service.createPhaseOtFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nom: expect.any(Object),
            description: expect.any(Object),
            duree: expect.any(Object),
            bloquante: expect.any(Object),
            statut: expect.any(Object),
            dateDebut: expect.any(Object),
            dl: expect.any(Object),
            dlc: expect.any(Object),
            phaseParentId: expect.any(Object),
          })
        );
      });
    });

    describe('getPhaseOt', () => {
      it('should return NewPhaseOt for default PhaseOt initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createPhaseOtFormGroup(sampleWithNewData);

        const phaseOt = service.getPhaseOt(formGroup) as any;

        expect(phaseOt).toMatchObject(sampleWithNewData);
      });

      it('should return NewPhaseOt for empty PhaseOt initial value', () => {
        const formGroup = service.createPhaseOtFormGroup();

        const phaseOt = service.getPhaseOt(formGroup) as any;

        expect(phaseOt).toMatchObject({});
      });

      it('should return IPhaseOt', () => {
        const formGroup = service.createPhaseOtFormGroup(sampleWithRequiredData);

        const phaseOt = service.getPhaseOt(formGroup) as any;

        expect(phaseOt).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPhaseOt should not enable id FormControl', () => {
        const formGroup = service.createPhaseOtFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPhaseOt should disable id FormControl', () => {
        const formGroup = service.createPhaseOtFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
