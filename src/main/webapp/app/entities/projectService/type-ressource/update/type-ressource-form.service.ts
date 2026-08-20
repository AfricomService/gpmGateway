import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ITypeRessource, NewTypeRessource } from '../type-ressource.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITypeRessource for edit and NewTypeRessourceFormGroupInput for create.
 */
type TypeRessourceFormGroupInput = ITypeRessource | PartialWithRequiredKeyOf<NewTypeRessource>;

type TypeRessourceFormDefaults = Pick<NewTypeRessource, 'id'>;

type TypeRessourceFormGroupContent = {
  id: FormControl<ITypeRessource['id'] | NewTypeRessource['id']>;
  type: FormControl<ITypeRessource['type']>;
  code: FormControl<ITypeRessource['code']>;
};

export type TypeRessourceFormGroup = FormGroup<TypeRessourceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TypeRessourceFormService {
  createTypeRessourceFormGroup(typeRessource: TypeRessourceFormGroupInput = { id: null }): TypeRessourceFormGroup {
    const typeRessourceRawValue = {
      ...this.getFormDefaults(),
      ...typeRessource,
    };
    return new FormGroup<TypeRessourceFormGroupContent>({
      id: new FormControl(
        { value: typeRessourceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      type: new FormControl(typeRessourceRawValue.type),
      code: new FormControl(typeRessourceRawValue.code),
    });
  }

  getTypeRessource(form: TypeRessourceFormGroup): ITypeRessource | NewTypeRessource {
    return form.getRawValue() as ITypeRessource | NewTypeRessource;
  }

  resetForm(form: TypeRessourceFormGroup, typeRessource: TypeRessourceFormGroupInput): void {
    const typeRessourceRawValue = { ...this.getFormDefaults(), ...typeRessource };
    form.reset(
      {
        ...typeRessourceRawValue,
        id: { value: typeRessourceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): TypeRessourceFormDefaults {
    return {
      id: null,
    };
  }
}
