import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../tache.test-samples';

import { TacheFormService } from './tache-form.service';

describe('Tache Form Service', () => {
  let service: TacheFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TacheFormService);
  });

  describe('Service methods', () => {
    describe('createTacheFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTacheFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            roleDansLaMission: expect.any(Object),
            note: expect.any(Object),
            remboursement: expect.any(Object),
            executeurId: expect.any(Object),
            executeurUserLogin: expect.any(Object),
            workOrder: expect.any(Object),
            activite: expect.any(Object),
          })
        );
      });

      it('passing ITache should create a new form with FormGroup', () => {
        const formGroup = service.createTacheFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            roleDansLaMission: expect.any(Object),
            note: expect.any(Object),
            remboursement: expect.any(Object),
            executeurId: expect.any(Object),
            executeurUserLogin: expect.any(Object),
            workOrder: expect.any(Object),
            activite: expect.any(Object),
          })
        );
      });
    });

    describe('getTache', () => {
      it('should return NewTache for default Tache initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createTacheFormGroup(sampleWithNewData);

        const tache = service.getTache(formGroup) as any;

        expect(tache).toMatchObject(sampleWithNewData);
      });

      it('should return NewTache for empty Tache initial value', () => {
        const formGroup = service.createTacheFormGroup();

        const tache = service.getTache(formGroup) as any;

        expect(tache).toMatchObject({});
      });

      it('should return ITache', () => {
        const formGroup = service.createTacheFormGroup(sampleWithRequiredData);

        const tache = service.getTache(formGroup) as any;

        expect(tache).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITache should not enable id FormControl', () => {
        const formGroup = service.createTacheFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTache should disable id FormControl', () => {
        const formGroup = service.createTacheFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
