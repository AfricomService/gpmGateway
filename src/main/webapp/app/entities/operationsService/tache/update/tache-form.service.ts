import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ITache, NewTache } from '../tache.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITache for edit and NewTacheFormGroupInput for create.
 */
type TacheFormGroupInput = ITache | PartialWithRequiredKeyOf<NewTache>;

type TacheFormDefaults = Pick<NewTache, 'id'>;

type TacheFormGroupContent = {
  id: FormControl<ITache['id'] | NewTache['id']>;
  roleDansLaMission: FormControl<ITache['roleDansLaMission']>;
  note: FormControl<ITache['note']>;
  remboursement: FormControl<ITache['remboursement']>;
  executeurId: FormControl<ITache['executeurId']>;
  executeurUserLogin: FormControl<ITache['executeurUserLogin']>;
  workOrder: FormControl<ITache['workOrder']>;
  activite: FormControl<ITache['activite']>;
};

export type TacheFormGroup = FormGroup<TacheFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TacheFormService {
  createTacheFormGroup(tache: TacheFormGroupInput = { id: null }): TacheFormGroup {
    const tacheRawValue = {
      ...this.getFormDefaults(),
      ...tache,
    };
    return new FormGroup<TacheFormGroupContent>({
      id: new FormControl(
        { value: tacheRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      roleDansLaMission: new FormControl(tacheRawValue.roleDansLaMission, {
        validators: [Validators.required],
      }),
      note: new FormControl(tacheRawValue.note),
      remboursement: new FormControl(tacheRawValue.remboursement),
      executeurId: new FormControl(tacheRawValue.executeurId),
      executeurUserLogin: new FormControl(tacheRawValue.executeurUserLogin),
      workOrder: new FormControl(tacheRawValue.workOrder, {
        validators: [Validators.required],
      }),
      activite: new FormControl(tacheRawValue.activite),
    });
  }

  getTache(form: TacheFormGroup): ITache | NewTache {
    return form.getRawValue() as ITache | NewTache;
  }

  resetForm(form: TacheFormGroup, tache: TacheFormGroupInput): void {
    const tacheRawValue = { ...this.getFormDefaults(), ...tache };
    form.reset(
      {
        ...tacheRawValue,
        id: { value: tacheRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): TacheFormDefaults {
    return {
      id: null,
    };
  }
}
