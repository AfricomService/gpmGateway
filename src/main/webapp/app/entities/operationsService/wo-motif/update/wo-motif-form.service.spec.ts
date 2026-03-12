import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../wo-motif.test-samples';

import { WoMotifFormService } from './wo-motif-form.service';

describe('WoMotif Form Service', () => {
  let service: WoMotifFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WoMotifFormService);
  });

  describe('Service methods', () => {
    describe('createWoMotifFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createWoMotifFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            workOrder: expect.any(Object),
            motif: expect.any(Object),
          })
        );
      });

      it('passing IWoMotif should create a new form with FormGroup', () => {
        const formGroup = service.createWoMotifFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            workOrder: expect.any(Object),
            motif: expect.any(Object),
          })
        );
      });
    });

    describe('getWoMotif', () => {
      it('should return NewWoMotif for default WoMotif initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createWoMotifFormGroup(sampleWithNewData);

        const woMotif = service.getWoMotif(formGroup) as any;

        expect(woMotif).toMatchObject(sampleWithNewData);
      });

      it('should return NewWoMotif for empty WoMotif initial value', () => {
        const formGroup = service.createWoMotifFormGroup();

        const woMotif = service.getWoMotif(formGroup) as any;

        expect(woMotif).toMatchObject({});
      });

      it('should return IWoMotif', () => {
        const formGroup = service.createWoMotifFormGroup(sampleWithRequiredData);

        const woMotif = service.getWoMotif(formGroup) as any;

        expect(woMotif).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IWoMotif should not enable id FormControl', () => {
        const formGroup = service.createWoMotifFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewWoMotif should disable id FormControl', () => {
        const formGroup = service.createWoMotifFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
