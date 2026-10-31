import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IParametreWO, NewParametreWO } from '../parametre-wo.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IParametreWO for edit and NewParametreWOFormGroupInput for create.
 */
type ParametreWOFormGroupInput = IParametreWO | PartialWithRequiredKeyOf<NewParametreWO>;

type ParametreWOFormDefaults = Pick<NewParametreWO, 'id'>;

type ParametreWOFormGroupContent = {
  id: FormControl<IParametreWO['id'] | NewParametreWO['id']>;
  nom: FormControl<IParametreWO['nom']>;
  description: FormControl<IParametreWO['description']>;
};

export type ParametreWOFormGroup = FormGroup<ParametreWOFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ParametreWOFormService {
  createParametreWOFormGroup(parametreWO: ParametreWOFormGroupInput = { id: null }): ParametreWOFormGroup {
    const parametreWORawValue = {
      ...this.getFormDefaults(),
      ...parametreWO,
    };
    return new FormGroup<ParametreWOFormGroupContent>({
      id: new FormControl(
        { value: parametreWORawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      nom: new FormControl(parametreWORawValue.nom),
      description: new FormControl(parametreWORawValue.description),
    });
  }

  getParametreWO(form: ParametreWOFormGroup): IParametreWO | NewParametreWO {
    return form.getRawValue() as IParametreWO | NewParametreWO;
  }

  resetForm(form: ParametreWOFormGroup, parametreWO: ParametreWOFormGroupInput): void {
    const parametreWORawValue = { ...this.getFormDefaults(), ...parametreWO };
    form.reset(
      {
        ...parametreWORawValue,
        id: { value: parametreWORawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ParametreWOFormDefaults {
    return {
      id: null,
    };
  }
}
