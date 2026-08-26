import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../bon-commande.test-samples';

import { BonCommandeFormService } from './bon-commande-form.service';

describe('BonCommande Form Service', () => {
  let service: BonCommandeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BonCommandeFormService);
  });

  describe('Service methods', () => {
    describe('createBonCommandeFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createBonCommandeFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            clientId: expect.any(Object),
            affaireId: expect.any(Object),
            lieu: expect.any(Object),
            responsableId: expect.any(Object),
            referenceClient: expect.any(Object),
            dateBonCommande: expect.any(Object),
            montantTotal: expect.any(Object),
            montantCommande: expect.any(Object),
            montantConsomme: expect.any(Object),
            montantMissionEffectue: expect.any(Object),
          })
        );
      });

      it('passing IBonCommande should create a new form with FormGroup', () => {
        const formGroup = service.createBonCommandeFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            clientId: expect.any(Object),
            affaireId: expect.any(Object),
            lieu: expect.any(Object),
            responsableId: expect.any(Object),
            referenceClient: expect.any(Object),
            dateBonCommande: expect.any(Object),
            montantTotal: expect.any(Object),
            montantCommande: expect.any(Object),
            montantConsomme: expect.any(Object),
            montantMissionEffectue: expect.any(Object),
          })
        );
      });
    });

    describe('getBonCommande', () => {
      it('should return NewBonCommande for default BonCommande initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createBonCommandeFormGroup(sampleWithNewData);

        const bonCommande = service.getBonCommande(formGroup) as any;

        expect(bonCommande).toMatchObject(sampleWithNewData);
      });

      it('should return NewBonCommande for empty BonCommande initial value', () => {
        const formGroup = service.createBonCommandeFormGroup();

        const bonCommande = service.getBonCommande(formGroup) as any;

        expect(bonCommande).toMatchObject({});
      });

      it('should return IBonCommande', () => {
        const formGroup = service.createBonCommandeFormGroup(sampleWithRequiredData);

        const bonCommande = service.getBonCommande(formGroup) as any;

        expect(bonCommande).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IBonCommande should not enable id FormControl', () => {
        const formGroup = service.createBonCommandeFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewBonCommande should disable id FormControl', () => {
        const formGroup = service.createBonCommandeFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
