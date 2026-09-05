import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IModelPhaseOT, NewModelPhaseOT } from '../model-phase-ot.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IModelPhaseOT for edit and NewModelPhaseOTFormGroupInput for create.
 */
type ModelPhaseOTFormGroupInput = IModelPhaseOT | PartialWithRequiredKeyOf<NewModelPhaseOT>;

type ModelPhaseOTFormDefaults = Pick<NewModelPhaseOT, 'id'>;

type ModelPhaseOTFormGroupContent = {
  id: FormControl<IModelPhaseOT['id'] | NewModelPhaseOT['id']>;
  nom: FormControl<IModelPhaseOT['nom']>;
  description: FormControl<IModelPhaseOT['description']>;
};

export type ModelPhaseOTFormGroup = FormGroup<ModelPhaseOTFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ModelPhaseOTFormService {
  createModelPhaseOTFormGroup(modelPhaseOT: ModelPhaseOTFormGroupInput = { id: null }): ModelPhaseOTFormGroup {
    const modelPhaseOTRawValue = {
      ...this.getFormDefaults(),
      ...modelPhaseOT,
    };
    return new FormGroup<ModelPhaseOTFormGroupContent>({
      id: new FormControl(
        { value: modelPhaseOTRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      nom: new FormControl(modelPhaseOTRawValue.nom),
      description: new FormControl(modelPhaseOTRawValue.description),
    });
  }

  getModelPhaseOT(form: ModelPhaseOTFormGroup): IModelPhaseOT | NewModelPhaseOT {
    return form.getRawValue() as IModelPhaseOT | NewModelPhaseOT;
  }

  resetForm(form: ModelPhaseOTFormGroup, modelPhaseOT: ModelPhaseOTFormGroupInput): void {
    const modelPhaseOTRawValue = { ...this.getFormDefaults(), ...modelPhaseOT };
    form.reset(
      {
        ...modelPhaseOTRawValue,
        id: { value: modelPhaseOTRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ModelPhaseOTFormDefaults {
    return {
      id: null,
    };
  }
}
