import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../matrice-facturation.test-samples';

import { MatriceFacturationFormService } from './matrice-facturation-form.service';

describe('MatriceFacturation Form Service', () => {
  let service: MatriceFacturationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatriceFacturationFormService);
  });

  describe('Service methods', () => {
    describe('createMatriceFacturationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createMatriceFacturationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tarifBase: expect.any(Object),
            tarifMissionNuit: expect.any(Object),
            tarifHebergement: expect.any(Object),
            tarifJourFerie: expect.any(Object),
            tarifDimanche: expect.any(Object),
            affaire: expect.any(Object),
            ville: expect.any(Object),
            zone: expect.any(Object),
          })
        );
      });

      it('passing IMatriceFacturation should create a new form with FormGroup', () => {
        const formGroup = service.createMatriceFacturationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            tarifBase: expect.any(Object),
            tarifMissionNuit: expect.any(Object),
            tarifHebergement: expect.any(Object),
            tarifJourFerie: expect.any(Object),
            tarifDimanche: expect.any(Object),
            affaire: expect.any(Object),
            ville: expect.any(Object),
            zone: expect.any(Object),
          })
        );
      });
    });

    describe('getMatriceFacturation', () => {
      it('should return NewMatriceFacturation for default MatriceFacturation initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createMatriceFacturationFormGroup(sampleWithNewData);

        const matriceFacturation = service.getMatriceFacturation(formGroup) as any;

        expect(matriceFacturation).toMatchObject(sampleWithNewData);
      });

      it('should return NewMatriceFacturation for empty MatriceFacturation initial value', () => {
        const formGroup = service.createMatriceFacturationFormGroup();

        const matriceFacturation = service.getMatriceFacturation(formGroup) as any;

        expect(matriceFacturation).toMatchObject({});
      });

      it('should return IMatriceFacturation', () => {
        const formGroup = service.createMatriceFacturationFormGroup(sampleWithRequiredData);

        const matriceFacturation = service.getMatriceFacturation(formGroup) as any;

        expect(matriceFacturation).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IMatriceFacturation should not enable id FormControl', () => {
        const formGroup = service.createMatriceFacturationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewMatriceFacturation should disable id FormControl', () => {
        const formGroup = service.createMatriceFacturationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
