import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../detail-ressource.test-samples';

import { DetailRessourceFormService } from './detail-ressource-form.service';

describe('DetailRessource Form Service', () => {
  let service: DetailRessourceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailRessourceFormService);
  });

  describe('Service methods', () => {
    describe('createDetailRessourceFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDetailRessourceFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            status: expect.any(Object),
            label: expect.any(Object),
            code: expect.any(Object),
            required: expect.any(Object),
            inputType: expect.any(Object),
            multipleChoiceOption: expect.any(Object),
          })
        );
      });

      it('passing IDetailRessource should create a new form with FormGroup', () => {
        const formGroup = service.createDetailRessourceFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            status: expect.any(Object),
            label: expect.any(Object),
            code: expect.any(Object),
            required: expect.any(Object),
            inputType: expect.any(Object),
            multipleChoiceOption: expect.any(Object),
          })
        );
      });
    });

    describe('getDetailRessource', () => {
      it('should return NewDetailRessource for default DetailRessource initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createDetailRessourceFormGroup(sampleWithNewData);

        const detailRessource = service.getDetailRessource(formGroup) as any;

        expect(detailRessource).toMatchObject(sampleWithNewData);
      });

      it('should return NewDetailRessource for empty DetailRessource initial value', () => {
        const formGroup = service.createDetailRessourceFormGroup();

        const detailRessource = service.getDetailRessource(formGroup) as any;

        expect(detailRessource).toMatchObject({});
      });

      it('should return IDetailRessource', () => {
        const formGroup = service.createDetailRessourceFormGroup(sampleWithRequiredData);

        const detailRessource = service.getDetailRessource(formGroup) as any;

        expect(detailRessource).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDetailRessource should not enable id FormControl', () => {
        const formGroup = service.createDetailRessourceFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDetailRessource should disable id FormControl', () => {
        const formGroup = service.createDetailRessourceFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
