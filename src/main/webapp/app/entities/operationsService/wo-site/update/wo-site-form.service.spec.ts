import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../wo-site.test-samples';

import { WoSiteFormService } from './wo-site-form.service';

describe('WoSite Form Service', () => {
  let service: WoSiteFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WoSiteFormService);
  });

  describe('Service methods', () => {
    describe('createWoSiteFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createWoSiteFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            siteCode: expect.any(Object),
            workOrder: expect.any(Object),
          })
        );
      });

      it('passing IWoSite should create a new form with FormGroup', () => {
        const formGroup = service.createWoSiteFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            siteCode: expect.any(Object),
            workOrder: expect.any(Object),
          })
        );
      });
    });

    describe('getWoSite', () => {
      it('should return NewWoSite for default WoSite initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createWoSiteFormGroup(sampleWithNewData);

        const woSite = service.getWoSite(formGroup) as any;

        expect(woSite).toMatchObject(sampleWithNewData);
      });

      it('should return NewWoSite for empty WoSite initial value', () => {
        const formGroup = service.createWoSiteFormGroup();

        const woSite = service.getWoSite(formGroup) as any;

        expect(woSite).toMatchObject({});
      });

      it('should return IWoSite', () => {
        const formGroup = service.createWoSiteFormGroup(sampleWithRequiredData);

        const woSite = service.getWoSite(formGroup) as any;

        expect(woSite).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IWoSite should not enable id FormControl', () => {
        const formGroup = service.createWoSiteFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewWoSite should disable id FormControl', () => {
        const formGroup = service.createWoSiteFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
