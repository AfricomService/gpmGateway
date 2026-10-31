import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IParametrageDeplacement, NewParametrageDeplacement } from '../parametrage-deplacement.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IParametrageDeplacement for edit and NewParametrageDeplacementFormGroupInput for create.
 */
type ParametrageDeplacementFormGroupInput = IParametrageDeplacement | PartialWithRequiredKeyOf<NewParametrageDeplacement>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IParametrageDeplacement | NewParametrageDeplacement> = Omit<T, 'date'> & {
  date?: string | null;
};

type ParametrageDeplacementFormRawValue = FormValueOf<IParametrageDeplacement>;

type NewParametrageDeplacementFormRawValue = FormValueOf<NewParametrageDeplacement>;

type ParametrageDeplacementFormDefaults = Pick<NewParametrageDeplacement, 'id' | 'date'>;

type ParametrageDeplacementFormGroupContent = {
  id: FormControl<ParametrageDeplacementFormRawValue['id'] | NewParametrageDeplacement['id']>;
  workOrderId: FormControl<ParametrageDeplacementFormRawValue['workOrderId']>;
  date: FormControl<ParametrageDeplacementFormRawValue['date']>;
  params: FormControl<ParametrageDeplacementFormRawValue['params']>;
};

export type ParametrageDeplacementFormGroup = FormGroup<ParametrageDeplacementFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ParametrageDeplacementFormService {
  createParametrageDeplacementFormGroup(
    parametrageDeplacement: ParametrageDeplacementFormGroupInput = { id: null }
  ): ParametrageDeplacementFormGroup {
    const parametrageDeplacementRawValue = this.convertParametrageDeplacementToParametrageDeplacementRawValue({
      ...this.getFormDefaults(),
      ...parametrageDeplacement,
    });
    return new FormGroup<ParametrageDeplacementFormGroupContent>({
      id: new FormControl(
        { value: parametrageDeplacementRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      workOrderId: new FormControl(parametrageDeplacementRawValue.workOrderId),
      date: new FormControl(parametrageDeplacementRawValue.date),
      params: new FormControl(parametrageDeplacementRawValue.params),
    });
  }

  getParametrageDeplacement(form: ParametrageDeplacementFormGroup): IParametrageDeplacement | NewParametrageDeplacement {
    return this.convertParametrageDeplacementRawValueToParametrageDeplacement(
      form.getRawValue() as ParametrageDeplacementFormRawValue | NewParametrageDeplacementFormRawValue
    );
  }

  resetForm(form: ParametrageDeplacementFormGroup, parametrageDeplacement: ParametrageDeplacementFormGroupInput): void {
    const parametrageDeplacementRawValue = this.convertParametrageDeplacementToParametrageDeplacementRawValue({
      ...this.getFormDefaults(),
      ...parametrageDeplacement,
    });
    form.reset(
      {
        ...parametrageDeplacementRawValue,
        id: { value: parametrageDeplacementRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ParametrageDeplacementFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      date: currentTime,
    };
  }

  private convertParametrageDeplacementRawValueToParametrageDeplacement(
    rawParametrageDeplacement: ParametrageDeplacementFormRawValue | NewParametrageDeplacementFormRawValue
  ): IParametrageDeplacement | NewParametrageDeplacement {
    return {
      ...rawParametrageDeplacement,
      date: dayjs(rawParametrageDeplacement.date, DATE_TIME_FORMAT),
    };
  }

  private convertParametrageDeplacementToParametrageDeplacementRawValue(
    parametrageDeplacement: IParametrageDeplacement | (Partial<NewParametrageDeplacement> & ParametrageDeplacementFormDefaults)
  ): ParametrageDeplacementFormRawValue | PartialWithRequiredKeyOf<NewParametrageDeplacementFormRawValue> {
    return {
      ...parametrageDeplacement,
      date: parametrageDeplacement.date ? parametrageDeplacement.date.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
