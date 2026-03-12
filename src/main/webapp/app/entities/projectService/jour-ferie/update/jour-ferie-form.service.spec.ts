import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../jour-ferie.test-samples';

import { JourFerieFormService } from './jour-ferie-form.service';

describe('JourFerie Form Service', () => {
  let service: JourFerieFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JourFerieFormService);
  });

  describe('Service methods', () => {
    describe('createJourFerieFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createJourFerieFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            date: expect.any(Object),
            designation: expect.any(Object),
            annee: expect.any(Object),
          })
        );
      });

      it('passing IJourFerie should create a new form with FormGroup', () => {
        const formGroup = service.createJourFerieFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            date: expect.any(Object),
            designation: expect.any(Object),
            annee: expect.any(Object),
          })
        );
      });
    });

    describe('getJourFerie', () => {
      it('should return NewJourFerie for default JourFerie initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createJourFerieFormGroup(sampleWithNewData);

        const jourFerie = service.getJourFerie(formGroup) as any;

        expect(jourFerie).toMatchObject(sampleWithNewData);
      });

      it('should return NewJourFerie for empty JourFerie initial value', () => {
        const formGroup = service.createJourFerieFormGroup();

        const jourFerie = service.getJourFerie(formGroup) as any;

        expect(jourFerie).toMatchObject({});
      });

      it('should return IJourFerie', () => {
        const formGroup = service.createJourFerieFormGroup(sampleWithRequiredData);

        const jourFerie = service.getJourFerie(formGroup) as any;

        expect(jourFerie).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IJourFerie should not enable id FormControl', () => {
        const formGroup = service.createJourFerieFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewJourFerie should disable id FormControl', () => {
        const formGroup = service.createJourFerieFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
