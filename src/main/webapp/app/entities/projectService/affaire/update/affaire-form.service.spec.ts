import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../affaire.test-samples';

import { AffaireFormService } from './affaire-form.service';

describe('Affaire Form Service', () => {
  let service: AffaireFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AffaireFormService);
  });

  describe('Service methods', () => {
    describe('createAffaireFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAffaireFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            numAffaire: expect.any(Object),
            designationAffaire: expect.any(Object),
            bonDeCommande: expect.any(Object),
            montant: expect.any(Object),
            devise: expect.any(Object),
            dateDebut: expect.any(Object),
            dateCloture: expect.any(Object),
            datePassageExecution: expect.any(Object),
            lieuMultipleParMission: expect.any(Object),
            montantVente: expect.any(Object),
            montantBudgetaireMateriel: expect.any(Object),
            montantBudgetaireService: expect.any(Object),
            statut: expect.any(Object),
            responsableProjetId: expect.any(Object),
            responsableProjetUserLogin: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
            client: expect.any(Object),
          })
        );
      });

      it('passing IAffaire should create a new form with FormGroup', () => {
        const formGroup = service.createAffaireFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            numAffaire: expect.any(Object),
            designationAffaire: expect.any(Object),
            bonDeCommande: expect.any(Object),
            montant: expect.any(Object),
            devise: expect.any(Object),
            dateDebut: expect.any(Object),
            dateCloture: expect.any(Object),
            datePassageExecution: expect.any(Object),
            lieuMultipleParMission: expect.any(Object),
            montantVente: expect.any(Object),
            montantBudgetaireMateriel: expect.any(Object),
            montantBudgetaireService: expect.any(Object),
            statut: expect.any(Object),
            responsableProjetId: expect.any(Object),
            responsableProjetUserLogin: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
            client: expect.any(Object),
          })
        );
      });
    });

    describe('getAffaire', () => {
      it('should return NewAffaire for default Affaire initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createAffaireFormGroup(sampleWithNewData);

        const affaire = service.getAffaire(formGroup) as any;

        expect(affaire).toMatchObject(sampleWithNewData);
      });

      it('should return NewAffaire for empty Affaire initial value', () => {
        const formGroup = service.createAffaireFormGroup();

        const affaire = service.getAffaire(formGroup) as any;

        expect(affaire).toMatchObject({});
      });

      it('should return IAffaire', () => {
        const formGroup = service.createAffaireFormGroup(sampleWithRequiredData);

        const affaire = service.getAffaire(formGroup) as any;

        expect(affaire).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAffaire should not enable id FormControl', () => {
        const formGroup = service.createAffaireFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAffaire should disable id FormControl', () => {
        const formGroup = service.createAffaireFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
