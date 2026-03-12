import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IDevis, NewDevis } from '../devis.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDevis for edit and NewDevisFormGroupInput for create.
 */
type DevisFormGroupInput = IDevis | PartialWithRequiredKeyOf<NewDevis>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDevis | NewDevis> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type DevisFormRawValue = FormValueOf<IDevis>;

type NewDevisFormRawValue = FormValueOf<NewDevis>;

type DevisFormDefaults = Pick<NewDevis, 'id' | 'createdAt' | 'updatedAt'>;

type DevisFormGroupContent = {
  id: FormControl<DevisFormRawValue['id'] | NewDevis['id']>;
  reference: FormControl<DevisFormRawValue['reference']>;
  montant: FormControl<DevisFormRawValue['montant']>;
  date: FormControl<DevisFormRawValue['date']>;
  statut: FormControl<DevisFormRawValue['statut']>;
  workOrderId: FormControl<DevisFormRawValue['workOrderId']>;
  createdAt: FormControl<DevisFormRawValue['createdAt']>;
  updatedAt: FormControl<DevisFormRawValue['updatedAt']>;
  createdBy: FormControl<DevisFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<DevisFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<DevisFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<DevisFormRawValue['updatedByUserLogin']>;
  facture: FormControl<DevisFormRawValue['facture']>;
};

export type DevisFormGroup = FormGroup<DevisFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DevisFormService {
  createDevisFormGroup(devis: DevisFormGroupInput = { id: null }): DevisFormGroup {
    const devisRawValue = this.convertDevisToDevisRawValue({
      ...this.getFormDefaults(),
      ...devis,
    });
    return new FormGroup<DevisFormGroupContent>({
      id: new FormControl(
        { value: devisRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      reference: new FormControl(devisRawValue.reference, {
        validators: [Validators.required],
      }),
      montant: new FormControl(devisRawValue.montant, {
        validators: [Validators.required],
      }),
      date: new FormControl(devisRawValue.date, {
        validators: [Validators.required],
      }),
      statut: new FormControl(devisRawValue.statut, {
        validators: [Validators.required],
      }),
      workOrderId: new FormControl(devisRawValue.workOrderId),
      createdAt: new FormControl(devisRawValue.createdAt),
      updatedAt: new FormControl(devisRawValue.updatedAt),
      createdBy: new FormControl(devisRawValue.createdBy),
      createdByUserLogin: new FormControl(devisRawValue.createdByUserLogin),
      updatedBy: new FormControl(devisRawValue.updatedBy),
      updatedByUserLogin: new FormControl(devisRawValue.updatedByUserLogin),
      facture: new FormControl(devisRawValue.facture),
    });
  }

  getDevis(form: DevisFormGroup): IDevis | NewDevis {
    return this.convertDevisRawValueToDevis(form.getRawValue() as DevisFormRawValue | NewDevisFormRawValue);
  }

  resetForm(form: DevisFormGroup, devis: DevisFormGroupInput): void {
    const devisRawValue = this.convertDevisToDevisRawValue({ ...this.getFormDefaults(), ...devis });
    form.reset(
      {
        ...devisRawValue,
        id: { value: devisRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): DevisFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertDevisRawValueToDevis(rawDevis: DevisFormRawValue | NewDevisFormRawValue): IDevis | NewDevis {
    return {
      ...rawDevis,
      createdAt: dayjs(rawDevis.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawDevis.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertDevisToDevisRawValue(
    devis: IDevis | (Partial<NewDevis> & DevisFormDefaults)
  ): DevisFormRawValue | PartialWithRequiredKeyOf<NewDevisFormRawValue> {
    return {
      ...devis,
      createdAt: devis.createdAt ? devis.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: devis.updatedAt ? devis.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
