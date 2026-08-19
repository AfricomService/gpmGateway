import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../type-ressource.test-samples';

import { TypeRessourceFormService } from './type-ressource-form.service';

describe('TypeRessource Form Service', () => {
  let service: TypeRessourceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeRessourceFormService);
  });

  describe('Service methods', () => {
    describe('createTypeRessourceFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTypeRessourceFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            type: expect.any(Object),
            code: expect.any(Object),
          })
        );
      });

      it('passing ITypeRessource should create a new form with FormGroup', () => {
        const formGroup = service.createTypeRessourceFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            type: expect.any(Object),
            code: expect.any(Object),
          })
        );
      });
    });

    describe('getTypeRessource', () => {
      it('should return NewTypeRessource for default TypeRessource initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createTypeRessourceFormGroup(sampleWithNewData);

        const typeRessource = service.getTypeRessource(formGroup) as any;

        expect(typeRessource).toMatchObject(sampleWithNewData);
      });

      it('should return NewTypeRessource for empty TypeRessource initial value', () => {
        const formGroup = service.createTypeRessourceFormGroup();

        const typeRessource = service.getTypeRessource(formGroup) as any;

        expect(typeRessource).toMatchObject({});
      });

      it('should return ITypeRessource', () => {
        const formGroup = service.createTypeRessourceFormGroup(sampleWithRequiredData);

        const typeRessource = service.getTypeRessource(formGroup) as any;

        expect(typeRessource).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITypeRessource should not enable id FormControl', () => {
        const formGroup = service.createTypeRessourceFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTypeRessource should disable id FormControl', () => {
        const formGroup = service.createTypeRessourceFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
