import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ISST, NewSST } from '../sst.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISST for edit and NewSSTFormGroupInput for create.
 */
type SSTFormGroupInput = ISST | PartialWithRequiredKeyOf<NewSST>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ISST | NewSST> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type SSTFormRawValue = FormValueOf<ISST>;

type NewSSTFormRawValue = FormValueOf<NewSST>;

type SSTFormDefaults = Pick<NewSST, 'id' | 'incidentPresent' | 'arretTravail' | 'createdAt' | 'updatedAt'>;

type SSTFormGroupContent = {
  id: FormControl<SSTFormRawValue['id'] | NewSST['id']>;
  label: FormControl<SSTFormRawValue['label']>;
  date: FormControl<SSTFormRawValue['date']>;
  importance: FormControl<SSTFormRawValue['importance']>;
  commentaire: FormControl<SSTFormRawValue['commentaire']>;
  incidentPresent: FormControl<SSTFormRawValue['incidentPresent']>;
  arretTravail: FormControl<SSTFormRawValue['arretTravail']>;
  createdAt: FormControl<SSTFormRawValue['createdAt']>;
  updatedAt: FormControl<SSTFormRawValue['updatedAt']>;
  createdBy: FormControl<SSTFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<SSTFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<SSTFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<SSTFormRawValue['updatedByUserLogin']>;
  workOrder: FormControl<SSTFormRawValue['workOrder']>;
};

export type SSTFormGroup = FormGroup<SSTFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SSTFormService {
  createSSTFormGroup(sST: SSTFormGroupInput = { id: null }): SSTFormGroup {
    const sSTRawValue = this.convertSSTToSSTRawValue({
      ...this.getFormDefaults(),
      ...sST,
    });
    return new FormGroup<SSTFormGroupContent>({
      id: new FormControl(
        { value: sSTRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      label: new FormControl(sSTRawValue.label, {
        validators: [Validators.required],
      }),
      date: new FormControl(sSTRawValue.date, {
        validators: [Validators.required],
      }),
      importance: new FormControl(sSTRawValue.importance, {
        validators: [Validators.required],
      }),
      commentaire: new FormControl(sSTRawValue.commentaire),
      incidentPresent: new FormControl(sSTRawValue.incidentPresent, {
        validators: [Validators.required],
      }),
      arretTravail: new FormControl(sSTRawValue.arretTravail, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(sSTRawValue.createdAt),
      updatedAt: new FormControl(sSTRawValue.updatedAt),
      createdBy: new FormControl(sSTRawValue.createdBy),
      createdByUserLogin: new FormControl(sSTRawValue.createdByUserLogin),
      updatedBy: new FormControl(sSTRawValue.updatedBy),
      updatedByUserLogin: new FormControl(sSTRawValue.updatedByUserLogin),
      workOrder: new FormControl(sSTRawValue.workOrder, {
        validators: [Validators.required],
      }),
    });
  }

  getSST(form: SSTFormGroup): ISST | NewSST {
    return this.convertSSTRawValueToSST(form.getRawValue() as SSTFormRawValue | NewSSTFormRawValue);
  }

  resetForm(form: SSTFormGroup, sST: SSTFormGroupInput): void {
    const sSTRawValue = this.convertSSTToSSTRawValue({ ...this.getFormDefaults(), ...sST });
    form.reset(
      {
        ...sSTRawValue,
        id: { value: sSTRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): SSTFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      incidentPresent: false,
      arretTravail: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertSSTRawValueToSST(rawSST: SSTFormRawValue | NewSSTFormRawValue): ISST | NewSST {
    return {
      ...rawSST,
      createdAt: dayjs(rawSST.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawSST.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertSSTToSSTRawValue(
    sST: ISST | (Partial<NewSST> & SSTFormDefaults)
  ): SSTFormRawValue | PartialWithRequiredKeyOf<NewSSTFormRawValue> {
    return {
      ...sST,
      createdAt: sST.createdAt ? sST.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: sST.updatedAt ? sST.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
