import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../piece-jointe.test-samples';

import { PieceJointeFormService } from './piece-jointe-form.service';

describe('PieceJointe Form Service', () => {
  let service: PieceJointeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PieceJointeFormService);
  });

  describe('Service methods', () => {
    describe('createPieceJointeFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPieceJointeFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nomFichier: expect.any(Object),
            type: expect.any(Object),
            fichierURL: expect.any(Object),
            dateUpload: expect.any(Object),
            workOrderId: expect.any(Object),
            affaire: expect.any(Object),
          })
        );
      });

      it('passing IPieceJointe should create a new form with FormGroup', () => {
        const formGroup = service.createPieceJointeFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nomFichier: expect.any(Object),
            type: expect.any(Object),
            fichierURL: expect.any(Object),
            dateUpload: expect.any(Object),
            workOrderId: expect.any(Object),
            affaire: expect.any(Object),
          })
        );
      });
    });

    describe('getPieceJointe', () => {
      it('should return NewPieceJointe for default PieceJointe initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createPieceJointeFormGroup(sampleWithNewData);

        const pieceJointe = service.getPieceJointe(formGroup) as any;

        expect(pieceJointe).toMatchObject(sampleWithNewData);
      });

      it('should return NewPieceJointe for empty PieceJointe initial value', () => {
        const formGroup = service.createPieceJointeFormGroup();

        const pieceJointe = service.getPieceJointe(formGroup) as any;

        expect(pieceJointe).toMatchObject({});
      });

      it('should return IPieceJointe', () => {
        const formGroup = service.createPieceJointeFormGroup(sampleWithRequiredData);

        const pieceJointe = service.getPieceJointe(formGroup) as any;

        expect(pieceJointe).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPieceJointe should not enable id FormControl', () => {
        const formGroup = service.createPieceJointeFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPieceJointe should disable id FormControl', () => {
        const formGroup = service.createPieceJointeFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
