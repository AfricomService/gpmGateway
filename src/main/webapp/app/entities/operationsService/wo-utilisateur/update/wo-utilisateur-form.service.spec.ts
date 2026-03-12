import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../wo-utilisateur.test-samples';

import { WoUtilisateurFormService } from './wo-utilisateur-form.service';

describe('WoUtilisateur Form Service', () => {
  let service: WoUtilisateurFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WoUtilisateurFormService);
  });

  describe('Service methods', () => {
    describe('createWoUtilisateurFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createWoUtilisateurFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            role: expect.any(Object),
            userId: expect.any(Object),
            userLogin: expect.any(Object),
            workOrder: expect.any(Object),
          })
        );
      });

      it('passing IWoUtilisateur should create a new form with FormGroup', () => {
        const formGroup = service.createWoUtilisateurFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            role: expect.any(Object),
            userId: expect.any(Object),
            userLogin: expect.any(Object),
            workOrder: expect.any(Object),
          })
        );
      });
    });

    describe('getWoUtilisateur', () => {
      it('should return NewWoUtilisateur for default WoUtilisateur initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createWoUtilisateurFormGroup(sampleWithNewData);

        const woUtilisateur = service.getWoUtilisateur(formGroup) as any;

        expect(woUtilisateur).toMatchObject(sampleWithNewData);
      });

      it('should return NewWoUtilisateur for empty WoUtilisateur initial value', () => {
        const formGroup = service.createWoUtilisateurFormGroup();

        const woUtilisateur = service.getWoUtilisateur(formGroup) as any;

        expect(woUtilisateur).toMatchObject({});
      });

      it('should return IWoUtilisateur', () => {
        const formGroup = service.createWoUtilisateurFormGroup(sampleWithRequiredData);

        const woUtilisateur = service.getWoUtilisateur(formGroup) as any;

        expect(woUtilisateur).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IWoUtilisateur should not enable id FormControl', () => {
        const formGroup = service.createWoUtilisateurFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewWoUtilisateur should disable id FormControl', () => {
        const formGroup = service.createWoUtilisateurFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
