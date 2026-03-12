import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IMotif, NewMotif } from '../motif.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMotif for edit and NewMotifFormGroupInput for create.
 */
type MotifFormGroupInput = IMotif | PartialWithRequiredKeyOf<NewMotif>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IMotif | NewMotif> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type MotifFormRawValue = FormValueOf<IMotif>;

type NewMotifFormRawValue = FormValueOf<NewMotif>;

type MotifFormDefaults = Pick<NewMotif, 'id' | 'createdAt' | 'updatedAt'>;

type MotifFormGroupContent = {
  id: FormControl<MotifFormRawValue['id'] | NewMotif['id']>;
  designation: FormControl<MotifFormRawValue['designation']>;
  createdAt: FormControl<MotifFormRawValue['createdAt']>;
  updatedAt: FormControl<MotifFormRawValue['updatedAt']>;
  createdBy: FormControl<MotifFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<MotifFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<MotifFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<MotifFormRawValue['updatedByUserLogin']>;
};

export type MotifFormGroup = FormGroup<MotifFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class MotifFormService {
  createMotifFormGroup(motif: MotifFormGroupInput = { id: null }): MotifFormGroup {
    const motifRawValue = this.convertMotifToMotifRawValue({
      ...this.getFormDefaults(),
      ...motif,
    });
    return new FormGroup<MotifFormGroupContent>({
      id: new FormControl(
        { value: motifRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      designation: new FormControl(motifRawValue.designation, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(motifRawValue.createdAt),
      updatedAt: new FormControl(motifRawValue.updatedAt),
      createdBy: new FormControl(motifRawValue.createdBy),
      createdByUserLogin: new FormControl(motifRawValue.createdByUserLogin),
      updatedBy: new FormControl(motifRawValue.updatedBy),
      updatedByUserLogin: new FormControl(motifRawValue.updatedByUserLogin),
    });
  }

  getMotif(form: MotifFormGroup): IMotif | NewMotif {
    return this.convertMotifRawValueToMotif(form.getRawValue() as MotifFormRawValue | NewMotifFormRawValue);
  }

  resetForm(form: MotifFormGroup, motif: MotifFormGroupInput): void {
    const motifRawValue = this.convertMotifToMotifRawValue({ ...this.getFormDefaults(), ...motif });
    form.reset(
      {
        ...motifRawValue,
        id: { value: motifRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): MotifFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertMotifRawValueToMotif(rawMotif: MotifFormRawValue | NewMotifFormRawValue): IMotif | NewMotif {
    return {
      ...rawMotif,
      createdAt: dayjs(rawMotif.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawMotif.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertMotifToMotifRawValue(
    motif: IMotif | (Partial<NewMotif> & MotifFormDefaults)
  ): MotifFormRawValue | PartialWithRequiredKeyOf<NewMotifFormRawValue> {
    return {
      ...motif,
      createdAt: motif.createdAt ? motif.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: motif.updatedAt ? motif.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
