import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IDepenseDiverse, NewDepenseDiverse } from '../depense-diverse.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDepenseDiverse for edit and NewDepenseDiverseFormGroupInput for create.
 */
type DepenseDiverseFormGroupInput = IDepenseDiverse | PartialWithRequiredKeyOf<NewDepenseDiverse>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDepenseDiverse | NewDepenseDiverse> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type DepenseDiverseFormRawValue = FormValueOf<IDepenseDiverse>;

type NewDepenseDiverseFormRawValue = FormValueOf<NewDepenseDiverse>;

type DepenseDiverseFormDefaults = Pick<NewDepenseDiverse, 'id' | 'createdAt' | 'updatedAt'>;

type DepenseDiverseFormGroupContent = {
  id: FormControl<DepenseDiverseFormRawValue['id'] | NewDepenseDiverse['id']>;
  motif: FormControl<DepenseDiverseFormRawValue['motif']>;
  montant: FormControl<DepenseDiverseFormRawValue['montant']>;
  date: FormControl<DepenseDiverseFormRawValue['date']>;
  justificatif: FormControl<DepenseDiverseFormRawValue['justificatif']>;
  workOrderId: FormControl<DepenseDiverseFormRawValue['workOrderId']>;
  createdAt: FormControl<DepenseDiverseFormRawValue['createdAt']>;
  updatedAt: FormControl<DepenseDiverseFormRawValue['updatedAt']>;
  createdBy: FormControl<DepenseDiverseFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<DepenseDiverseFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<DepenseDiverseFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<DepenseDiverseFormRawValue['updatedByUserLogin']>;
};

export type DepenseDiverseFormGroup = FormGroup<DepenseDiverseFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DepenseDiverseFormService {
  createDepenseDiverseFormGroup(depenseDiverse: DepenseDiverseFormGroupInput = { id: null }): DepenseDiverseFormGroup {
    const depenseDiverseRawValue = this.convertDepenseDiverseToDepenseDiverseRawValue({
      ...this.getFormDefaults(),
      ...depenseDiverse,
    });
    return new FormGroup<DepenseDiverseFormGroupContent>({
      id: new FormControl(
        { value: depenseDiverseRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      motif: new FormControl(depenseDiverseRawValue.motif, {
        validators: [Validators.required],
      }),
      montant: new FormControl(depenseDiverseRawValue.montant, {
        validators: [Validators.required],
      }),
      date: new FormControl(depenseDiverseRawValue.date),
      justificatif: new FormControl(depenseDiverseRawValue.justificatif),
      workOrderId: new FormControl(depenseDiverseRawValue.workOrderId),
      createdAt: new FormControl(depenseDiverseRawValue.createdAt),
      updatedAt: new FormControl(depenseDiverseRawValue.updatedAt),
      createdBy: new FormControl(depenseDiverseRawValue.createdBy),
      createdByUserLogin: new FormControl(depenseDiverseRawValue.createdByUserLogin),
      updatedBy: new FormControl(depenseDiverseRawValue.updatedBy),
      updatedByUserLogin: new FormControl(depenseDiverseRawValue.updatedByUserLogin),
    });
  }

  getDepenseDiverse(form: DepenseDiverseFormGroup): IDepenseDiverse | NewDepenseDiverse {
    return this.convertDepenseDiverseRawValueToDepenseDiverse(
      form.getRawValue() as DepenseDiverseFormRawValue | NewDepenseDiverseFormRawValue
    );
  }

  resetForm(form: DepenseDiverseFormGroup, depenseDiverse: DepenseDiverseFormGroupInput): void {
    const depenseDiverseRawValue = this.convertDepenseDiverseToDepenseDiverseRawValue({ ...this.getFormDefaults(), ...depenseDiverse });
    form.reset(
      {
        ...depenseDiverseRawValue,
        id: { value: depenseDiverseRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): DepenseDiverseFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertDepenseDiverseRawValueToDepenseDiverse(
    rawDepenseDiverse: DepenseDiverseFormRawValue | NewDepenseDiverseFormRawValue
  ): IDepenseDiverse | NewDepenseDiverse {
    return {
      ...rawDepenseDiverse,
      createdAt: dayjs(rawDepenseDiverse.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawDepenseDiverse.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertDepenseDiverseToDepenseDiverseRawValue(
    depenseDiverse: IDepenseDiverse | (Partial<NewDepenseDiverse> & DepenseDiverseFormDefaults)
  ): DepenseDiverseFormRawValue | PartialWithRequiredKeyOf<NewDepenseDiverseFormRawValue> {
    return {
      ...depenseDiverse,
      createdAt: depenseDiverse.createdAt ? depenseDiverse.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: depenseDiverse.updatedAt ? depenseDiverse.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
