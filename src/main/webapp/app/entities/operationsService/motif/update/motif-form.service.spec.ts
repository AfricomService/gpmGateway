import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../motif.test-samples';

import { MotifFormService } from './motif-form.service';

describe('Motif Form Service', () => {
  let service: MotifFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotifFormService);
  });

  describe('Service methods', () => {
    describe('createMotifFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createMotifFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            designation: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });

      it('passing IMotif should create a new form with FormGroup', () => {
        const formGroup = service.createMotifFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            designation: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            createdBy: expect.any(Object),
            createdByUserLogin: expect.any(Object),
            updatedBy: expect.any(Object),
            updatedByUserLogin: expect.any(Object),
          })
        );
      });
    });

    describe('getMotif', () => {
      it('should return NewMotif for default Motif initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createMotifFormGroup(sampleWithNewData);

        const motif = service.getMotif(formGroup) as any;

        expect(motif).toMatchObject(sampleWithNewData);
      });

      it('should return NewMotif for empty Motif initial value', () => {
        const formGroup = service.createMotifFormGroup();

        const motif = service.getMotif(formGroup) as any;

        expect(motif).toMatchObject({});
      });

      it('should return IMotif', () => {
        const formGroup = service.createMotifFormGroup(sampleWithRequiredData);

        const motif = service.getMotif(formGroup) as any;

        expect(motif).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IMotif should not enable id FormControl', () => {
        const formGroup = service.createMotifFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewMotif should disable id FormControl', () => {
        const formGroup = service.createMotifFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
