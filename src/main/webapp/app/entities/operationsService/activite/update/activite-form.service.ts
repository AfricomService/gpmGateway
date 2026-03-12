import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IActivite, NewActivite } from '../activite.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IActivite for edit and NewActiviteFormGroupInput for create.
 */
type ActiviteFormGroupInput = IActivite | PartialWithRequiredKeyOf<NewActivite>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IActivite | NewActivite> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ActiviteFormRawValue = FormValueOf<IActivite>;

type NewActiviteFormRawValue = FormValueOf<NewActivite>;

type ActiviteFormDefaults = Pick<NewActivite, 'id' | 'createdAt' | 'updatedAt'>;

type ActiviteFormGroupContent = {
  id: FormControl<ActiviteFormRawValue['id'] | NewActivite['id']>;
  code: FormControl<ActiviteFormRawValue['code']>;
  designation: FormControl<ActiviteFormRawValue['designation']>;
  createdAt: FormControl<ActiviteFormRawValue['createdAt']>;
  updatedAt: FormControl<ActiviteFormRawValue['updatedAt']>;
  createdBy: FormControl<ActiviteFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<ActiviteFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<ActiviteFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<ActiviteFormRawValue['updatedByUserLogin']>;
};

export type ActiviteFormGroup = FormGroup<ActiviteFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ActiviteFormService {
  createActiviteFormGroup(activite: ActiviteFormGroupInput = { id: null }): ActiviteFormGroup {
    const activiteRawValue = this.convertActiviteToActiviteRawValue({
      ...this.getFormDefaults(),
      ...activite,
    });
    return new FormGroup<ActiviteFormGroupContent>({
      id: new FormControl(
        { value: activiteRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      code: new FormControl(activiteRawValue.code, {
        validators: [Validators.required],
      }),
      designation: new FormControl(activiteRawValue.designation, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(activiteRawValue.createdAt),
      updatedAt: new FormControl(activiteRawValue.updatedAt),
      createdBy: new FormControl(activiteRawValue.createdBy),
      createdByUserLogin: new FormControl(activiteRawValue.createdByUserLogin),
      updatedBy: new FormControl(activiteRawValue.updatedBy),
      updatedByUserLogin: new FormControl(activiteRawValue.updatedByUserLogin),
    });
  }

  getActivite(form: ActiviteFormGroup): IActivite | NewActivite {
    return this.convertActiviteRawValueToActivite(form.getRawValue() as ActiviteFormRawValue | NewActiviteFormRawValue);
  }

  resetForm(form: ActiviteFormGroup, activite: ActiviteFormGroupInput): void {
    const activiteRawValue = this.convertActiviteToActiviteRawValue({ ...this.getFormDefaults(), ...activite });
    form.reset(
      {
        ...activiteRawValue,
        id: { value: activiteRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ActiviteFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertActiviteRawValueToActivite(rawActivite: ActiviteFormRawValue | NewActiviteFormRawValue): IActivite | NewActivite {
    return {
      ...rawActivite,
      createdAt: dayjs(rawActivite.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawActivite.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertActiviteToActiviteRawValue(
    activite: IActivite | (Partial<NewActivite> & ActiviteFormDefaults)
  ): ActiviteFormRawValue | PartialWithRequiredKeyOf<NewActiviteFormRawValue> {
    return {
      ...activite,
      createdAt: activite.createdAt ? activite.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: activite.updatedAt ? activite.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
