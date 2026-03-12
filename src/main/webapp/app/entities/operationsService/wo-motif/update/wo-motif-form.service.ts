import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IWoMotif, NewWoMotif } from '../wo-motif.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IWoMotif for edit and NewWoMotifFormGroupInput for create.
 */
type WoMotifFormGroupInput = IWoMotif | PartialWithRequiredKeyOf<NewWoMotif>;

type WoMotifFormDefaults = Pick<NewWoMotif, 'id'>;

type WoMotifFormGroupContent = {
  id: FormControl<IWoMotif['id'] | NewWoMotif['id']>;
  workOrder: FormControl<IWoMotif['workOrder']>;
  motif: FormControl<IWoMotif['motif']>;
};

export type WoMotifFormGroup = FormGroup<WoMotifFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class WoMotifFormService {
  createWoMotifFormGroup(woMotif: WoMotifFormGroupInput = { id: null }): WoMotifFormGroup {
    const woMotifRawValue = {
      ...this.getFormDefaults(),
      ...woMotif,
    };
    return new FormGroup<WoMotifFormGroupContent>({
      id: new FormControl(
        { value: woMotifRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      workOrder: new FormControl(woMotifRawValue.workOrder, {
        validators: [Validators.required],
      }),
      motif: new FormControl(woMotifRawValue.motif, {
        validators: [Validators.required],
      }),
    });
  }

  getWoMotif(form: WoMotifFormGroup): IWoMotif | NewWoMotif {
    return form.getRawValue() as IWoMotif | NewWoMotif;
  }

  resetForm(form: WoMotifFormGroup, woMotif: WoMotifFormGroupInput): void {
    const woMotifRawValue = { ...this.getFormDefaults(), ...woMotif };
    form.reset(
      {
        ...woMotifRawValue,
        id: { value: woMotifRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): WoMotifFormDefaults {
    return {
      id: null,
    };
  }
}
