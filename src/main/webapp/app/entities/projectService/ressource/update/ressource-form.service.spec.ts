import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../ressource.test-samples';

import { RessourceFormService } from './ressource-form.service';

describe('Ressource Form Service', () => {
  let service: RessourceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RessourceFormService);
  });

  describe('Service methods', () => {
    describe('createRessourceFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createRessourceFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nom: expect.any(Object),
            code: expect.any(Object),
            categorie: expect.any(Object),
            description: expect.any(Object),
            dateMiseEnService: expect.any(Object),
            dateDerniereMaintenance: expect.any(Object),
            dateProchaineMaintenance: expect.any(Object),
            typeRessourceId: expect.any(Object),
            statut: expect.any(Object),
          })
        );
      });

      it('passing IRessource should create a new form with FormGroup', () => {
        const formGroup = service.createRessourceFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nom: expect.any(Object),
            code: expect.any(Object),
            categorie: expect.any(Object),
            description: expect.any(Object),
            dateMiseEnService: expect.any(Object),
            dateDerniereMaintenance: expect.any(Object),
            dateProchaineMaintenance: expect.any(Object),
            typeRessourceId: expect.any(Object),
            statut: expect.any(Object),
          })
        );
      });
    });

    describe('getRessource', () => {
      it('should return NewRessource for default Ressource initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createRessourceFormGroup(sampleWithNewData);

        const ressource = service.getRessource(formGroup) as any;

        expect(ressource).toMatchObject(sampleWithNewData);
      });

      it('should return NewRessource for empty Ressource initial value', () => {
        const formGroup = service.createRessourceFormGroup();

        const ressource = service.getRessource(formGroup) as any;

        expect(ressource).toMatchObject({});
      });

      it('should return IRessource', () => {
        const formGroup = service.createRessourceFormGroup(sampleWithRequiredData);

        const ressource = service.getRessource(formGroup) as any;

        expect(ressource).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IRessource should not enable id FormControl', () => {
        const formGroup = service.createRessourceFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewRessource should disable id FormControl', () => {
        const formGroup = service.createRessourceFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
