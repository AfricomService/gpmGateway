import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../note-frais.test-samples';

import { NoteFraisFormService } from './note-frais-form.service';

describe('NoteFrais Form Service', () => {
  let service: NoteFraisFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteFraisFormService);
  });

  describe('Service methods', () => {
    describe('createNoteFraisFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createNoteFraisFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            dateDebut: expect.any(Object),
            dateFin: expect.any(Object),
            contactSocieteId: expect.any(Object),
            montantTotale: expect.any(Object),
            montantTotaleEnLettre: expect.any(Object),
          })
        );
      });

      it('passing INoteFrais should create a new form with FormGroup', () => {
        const formGroup = service.createNoteFraisFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            dateDebut: expect.any(Object),
            dateFin: expect.any(Object),
            contactSocieteId: expect.any(Object),
            montantTotale: expect.any(Object),
            montantTotaleEnLettre: expect.any(Object),
          })
        );
      });
    });

    describe('getNoteFrais', () => {
      it('should return NewNoteFrais for default NoteFrais initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createNoteFraisFormGroup(sampleWithNewData);

        const noteFrais = service.getNoteFrais(formGroup) as any;

        expect(noteFrais).toMatchObject(sampleWithNewData);
      });

      it('should return NewNoteFrais for empty NoteFrais initial value', () => {
        const formGroup = service.createNoteFraisFormGroup();

        const noteFrais = service.getNoteFrais(formGroup) as any;

        expect(noteFrais).toMatchObject({});
      });

      it('should return INoteFrais', () => {
        const formGroup = service.createNoteFraisFormGroup(sampleWithRequiredData);

        const noteFrais = service.getNoteFrais(formGroup) as any;

        expect(noteFrais).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing INoteFrais should not enable id FormControl', () => {
        const formGroup = service.createNoteFraisFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewNoteFrais should disable id FormControl', () => {
        const formGroup = service.createNoteFraisFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
