import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../model-phase-ot.test-samples';

import { ModelPhaseOTFormService } from './model-phase-ot-form.service';

describe('ModelPhaseOT Form Service', () => {
  let service: ModelPhaseOTFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelPhaseOTFormService);
  });

  describe('Service methods', () => {
    describe('createModelPhaseOTFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createModelPhaseOTFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nom: expect.any(Object),
            description: expect.any(Object),
          })
        );
      });

      it('passing IModelPhaseOT should create a new form with FormGroup', () => {
        const formGroup = service.createModelPhaseOTFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nom: expect.any(Object),
            description: expect.any(Object),
          })
        );
      });
    });

    describe('getModelPhaseOT', () => {
      it('should return NewModelPhaseOT for default ModelPhaseOT initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createModelPhaseOTFormGroup(sampleWithNewData);

        const modelPhaseOT = service.getModelPhaseOT(formGroup) as any;

        expect(modelPhaseOT).toMatchObject(sampleWithNewData);
      });

      it('should return NewModelPhaseOT for empty ModelPhaseOT initial value', () => {
        const formGroup = service.createModelPhaseOTFormGroup();

        const modelPhaseOT = service.getModelPhaseOT(formGroup) as any;

        expect(modelPhaseOT).toMatchObject({});
      });

      it('should return IModelPhaseOT', () => {
        const formGroup = service.createModelPhaseOTFormGroup(sampleWithRequiredData);

        const modelPhaseOT = service.getModelPhaseOT(formGroup) as any;

        expect(modelPhaseOT).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IModelPhaseOT should not enable id FormControl', () => {
        const formGroup = service.createModelPhaseOTFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewModelPhaseOT should disable id FormControl', () => {
        const formGroup = service.createModelPhaseOTFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
