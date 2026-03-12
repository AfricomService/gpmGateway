import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IOtExterne, NewOtExterne } from '../ot-externe.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IOtExterne for edit and NewOtExterneFormGroupInput for create.
 */
type OtExterneFormGroupInput = IOtExterne | PartialWithRequiredKeyOf<NewOtExterne>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IOtExterne | NewOtExterne> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type OtExterneFormRawValue = FormValueOf<IOtExterne>;

type NewOtExterneFormRawValue = FormValueOf<NewOtExterne>;

type OtExterneFormDefaults = Pick<NewOtExterne, 'id' | 'createdAt' | 'updatedAt'>;

type OtExterneFormGroupContent = {
  id: FormControl<OtExterneFormRawValue['id'] | NewOtExterne['id']>;
  reference: FormControl<OtExterneFormRawValue['reference']>;
  statut: FormControl<OtExterneFormRawValue['statut']>;
  affaireId: FormControl<OtExterneFormRawValue['affaireId']>;
  clientId: FormControl<OtExterneFormRawValue['clientId']>;
  createdAt: FormControl<OtExterneFormRawValue['createdAt']>;
  updatedAt: FormControl<OtExterneFormRawValue['updatedAt']>;
  createdBy: FormControl<OtExterneFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<OtExterneFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<OtExterneFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<OtExterneFormRawValue['updatedByUserLogin']>;
};

export type OtExterneFormGroup = FormGroup<OtExterneFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OtExterneFormService {
  createOtExterneFormGroup(otExterne: OtExterneFormGroupInput = { id: null }): OtExterneFormGroup {
    const otExterneRawValue = this.convertOtExterneToOtExterneRawValue({
      ...this.getFormDefaults(),
      ...otExterne,
    });
    return new FormGroup<OtExterneFormGroupContent>({
      id: new FormControl(
        { value: otExterneRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      reference: new FormControl(otExterneRawValue.reference, {
        validators: [Validators.required],
      }),
      statut: new FormControl(otExterneRawValue.statut, {
        validators: [Validators.required],
      }),
      affaireId: new FormControl(otExterneRawValue.affaireId),
      clientId: new FormControl(otExterneRawValue.clientId),
      createdAt: new FormControl(otExterneRawValue.createdAt),
      updatedAt: new FormControl(otExterneRawValue.updatedAt),
      createdBy: new FormControl(otExterneRawValue.createdBy),
      createdByUserLogin: new FormControl(otExterneRawValue.createdByUserLogin),
      updatedBy: new FormControl(otExterneRawValue.updatedBy),
      updatedByUserLogin: new FormControl(otExterneRawValue.updatedByUserLogin),
    });
  }

  getOtExterne(form: OtExterneFormGroup): IOtExterne | NewOtExterne {
    return this.convertOtExterneRawValueToOtExterne(form.getRawValue() as OtExterneFormRawValue | NewOtExterneFormRawValue);
  }

  resetForm(form: OtExterneFormGroup, otExterne: OtExterneFormGroupInput): void {
    const otExterneRawValue = this.convertOtExterneToOtExterneRawValue({ ...this.getFormDefaults(), ...otExterne });
    form.reset(
      {
        ...otExterneRawValue,
        id: { value: otExterneRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): OtExterneFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertOtExterneRawValueToOtExterne(rawOtExterne: OtExterneFormRawValue | NewOtExterneFormRawValue): IOtExterne | NewOtExterne {
    return {
      ...rawOtExterne,
      createdAt: dayjs(rawOtExterne.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawOtExterne.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertOtExterneToOtExterneRawValue(
    otExterne: IOtExterne | (Partial<NewOtExterne> & OtExterneFormDefaults)
  ): OtExterneFormRawValue | PartialWithRequiredKeyOf<NewOtExterneFormRawValue> {
    return {
      ...otExterne,
      createdAt: otExterne.createdAt ? otExterne.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: otExterne.updatedAt ? otExterne.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
