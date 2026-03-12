import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAgence, NewAgence } from '../agence.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAgence for edit and NewAgenceFormGroupInput for create.
 */
type AgenceFormGroupInput = IAgence | PartialWithRequiredKeyOf<NewAgence>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAgence | NewAgence> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AgenceFormRawValue = FormValueOf<IAgence>;

type NewAgenceFormRawValue = FormValueOf<NewAgence>;

type AgenceFormDefaults = Pick<NewAgence, 'id' | 'createdAt' | 'updatedAt'>;

type AgenceFormGroupContent = {
  id: FormControl<AgenceFormRawValue['id'] | NewAgence['id']>;
  designation: FormControl<AgenceFormRawValue['designation']>;
  adresse: FormControl<AgenceFormRawValue['adresse']>;
  ville: FormControl<AgenceFormRawValue['ville']>;
  pays: FormControl<AgenceFormRawValue['pays']>;
  createdAt: FormControl<AgenceFormRawValue['createdAt']>;
  updatedAt: FormControl<AgenceFormRawValue['updatedAt']>;
  createdBy: FormControl<AgenceFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<AgenceFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<AgenceFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<AgenceFormRawValue['updatedByUserLogin']>;
  societe: FormControl<AgenceFormRawValue['societe']>;
};

export type AgenceFormGroup = FormGroup<AgenceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AgenceFormService {
  createAgenceFormGroup(agence: AgenceFormGroupInput = { id: null }): AgenceFormGroup {
    const agenceRawValue = this.convertAgenceToAgenceRawValue({
      ...this.getFormDefaults(),
      ...agence,
    });
    return new FormGroup<AgenceFormGroupContent>({
      id: new FormControl(
        { value: agenceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      designation: new FormControl(agenceRawValue.designation, {
        validators: [Validators.required],
      }),
      adresse: new FormControl(agenceRawValue.adresse, {
        validators: [Validators.required],
      }),
      ville: new FormControl(agenceRawValue.ville, {
        validators: [Validators.required],
      }),
      pays: new FormControl(agenceRawValue.pays, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(agenceRawValue.createdAt),
      updatedAt: new FormControl(agenceRawValue.updatedAt),
      createdBy: new FormControl(agenceRawValue.createdBy),
      createdByUserLogin: new FormControl(agenceRawValue.createdByUserLogin),
      updatedBy: new FormControl(agenceRawValue.updatedBy),
      updatedByUserLogin: new FormControl(agenceRawValue.updatedByUserLogin),
      societe: new FormControl(agenceRawValue.societe, {
        validators: [Validators.required],
      }),
    });
  }

  getAgence(form: AgenceFormGroup): IAgence | NewAgence {
    return this.convertAgenceRawValueToAgence(form.getRawValue() as AgenceFormRawValue | NewAgenceFormRawValue);
  }

  resetForm(form: AgenceFormGroup, agence: AgenceFormGroupInput): void {
    const agenceRawValue = this.convertAgenceToAgenceRawValue({ ...this.getFormDefaults(), ...agence });
    form.reset(
      {
        ...agenceRawValue,
        id: { value: agenceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): AgenceFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertAgenceRawValueToAgence(rawAgence: AgenceFormRawValue | NewAgenceFormRawValue): IAgence | NewAgence {
    return {
      ...rawAgence,
      createdAt: dayjs(rawAgence.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawAgence.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertAgenceToAgenceRawValue(
    agence: IAgence | (Partial<NewAgence> & AgenceFormDefaults)
  ): AgenceFormRawValue | PartialWithRequiredKeyOf<NewAgenceFormRawValue> {
    return {
      ...agence,
      createdAt: agence.createdAt ? agence.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: agence.updatedAt ? agence.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
