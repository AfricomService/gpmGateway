import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../matrice-jour-ferie.test-samples';

import { MatriceJourFerieFormService } from './matrice-jour-ferie-form.service';

describe('MatriceJourFerie Form Service', () => {
  let service: MatriceJourFerieFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatriceJourFerieFormService);
  });

  describe('Service methods', () => {
    describe('createMatriceJourFerieFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createMatriceJourFerieFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tarifApplique: expect.any(Object),
            matrice: expect.any(Object),
            jourFerie: expect.any(Object),
          })
        );
      });

      it('passing IMatriceJourFerie should create a new form with FormGroup', () => {
        const formGroup = service.createMatriceJourFerieFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tarifApplique: expect.any(Object),
            matrice: expect.any(Object),
            jourFerie: expect.any(Object),
          })
        );
      });
    });

    describe('getMatriceJourFerie', () => {
      it('should return NewMatriceJourFerie for default MatriceJourFerie initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createMatriceJourFerieFormGroup(sampleWithNewData);

        const matriceJourFerie = service.getMatriceJourFerie(formGroup) as any;

        expect(matriceJourFerie).toMatchObject(sampleWithNewData);
      });

      it('should return NewMatriceJourFerie for empty MatriceJourFerie initial value', () => {
        const formGroup = service.createMatriceJourFerieFormGroup();

        const matriceJourFerie = service.getMatriceJourFerie(formGroup) as any;

        expect(matriceJourFerie).toMatchObject({});
      });

      it('should return IMatriceJourFerie', () => {
        const formGroup = service.createMatriceJourFerieFormGroup(sampleWithRequiredData);

        const matriceJourFerie = service.getMatriceJourFerie(formGroup) as any;

        expect(matriceJourFerie).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IMatriceJourFerie should not enable id FormControl', () => {
        const formGroup = service.createMatriceJourFerieFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewMatriceJourFerie should disable id FormControl', () => {
        const formGroup = service.createMatriceJourFerieFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
