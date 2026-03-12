import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../vehicule.test-samples';

import { VehiculeFormService } from './vehicule-form.service';

describe('Vehicule Form Service', () => {
  let service: VehiculeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehiculeFormService);
  });

  describe('Service methods', () => {
    describe('createVehiculeFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createVehiculeFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            marque: expect.any(Object),
            type: expect.any(Object),
            matricule: expect.any(Object),
            nbPlaces: expect.any(Object),
            numCarteGrise: expect.any(Object),
            dateCirculation: expect.any(Object),
            typeCarburant: expect.any(Object),
            chargeFixe: expect.any(Object),
            tauxConsommation: expect.any(Object),
            statut: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
            agence: expect.any(Object),
          })
        );
      });

      it('passing IVehicule should create a new form with FormGroup', () => {
        const formGroup = service.createVehiculeFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            marque: expect.any(Object),
            type: expect.any(Object),
            matricule: expect.any(Object),
            nbPlaces: expect.any(Object),
            numCarteGrise: expect.any(Object),
            dateCirculation: expect.any(Object),
            typeCarburant: expect.any(Object),
            chargeFixe: expect.any(Object),
            tauxConsommation: expect.any(Object),
            statut: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
            agence: expect.any(Object),
          })
        );
      });
    });

    describe('getVehicule', () => {
      it('should return NewVehicule for default Vehicule initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createVehiculeFormGroup(sampleWithNewData);

        const vehicule = service.getVehicule(formGroup) as any;

        expect(vehicule).toMatchObject(sampleWithNewData);
      });

      it('should return NewVehicule for empty Vehicule initial value', () => {
        const formGroup = service.createVehiculeFormGroup();

        const vehicule = service.getVehicule(formGroup) as any;

        expect(vehicule).toMatchObject({});
      });

      it('should return IVehicule', () => {
        const formGroup = service.createVehiculeFormGroup(sampleWithRequiredData);

        const vehicule = service.getVehicule(formGroup) as any;

        expect(vehicule).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IVehicule should not enable id FormControl', () => {
        const formGroup = service.createVehiculeFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewVehicule should disable id FormControl', () => {
        const formGroup = service.createVehiculeFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
