import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IDemandeEspece, NewDemandeEspece } from '../demande-espece.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDemandeEspece for edit and NewDemandeEspeceFormGroupInput for create.
 */
type DemandeEspeceFormGroupInput = IDemandeEspece | PartialWithRequiredKeyOf<NewDemandeEspece>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDemandeEspece | NewDemandeEspece> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type DemandeEspeceFormRawValue = FormValueOf<IDemandeEspece>;

type NewDemandeEspeceFormRawValue = FormValueOf<NewDemandeEspece>;

type DemandeEspeceFormDefaults = Pick<NewDemandeEspece, 'id' | 'createdAt' | 'updatedAt'>;

type DemandeEspeceFormGroupContent = {
  id: FormControl<DemandeEspeceFormRawValue['id'] | NewDemandeEspece['id']>;
  montant: FormControl<DemandeEspeceFormRawValue['montant']>;
  motif: FormControl<DemandeEspeceFormRawValue['motif']>;
  workOrderId: FormControl<DemandeEspeceFormRawValue['workOrderId']>;
  beneficiaireId: FormControl<DemandeEspeceFormRawValue['beneficiaireId']>;
  beneficiaireUserLogin: FormControl<DemandeEspeceFormRawValue['beneficiaireUserLogin']>;
  createdAt: FormControl<DemandeEspeceFormRawValue['createdAt']>;
  updatedAt: FormControl<DemandeEspeceFormRawValue['updatedAt']>;
  createdBy: FormControl<DemandeEspeceFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<DemandeEspeceFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<DemandeEspeceFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<DemandeEspeceFormRawValue['updatedByUserLogin']>;
};

export type DemandeEspeceFormGroup = FormGroup<DemandeEspeceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DemandeEspeceFormService {
  createDemandeEspeceFormGroup(demandeEspece: DemandeEspeceFormGroupInput = { id: null }): DemandeEspeceFormGroup {
    const demandeEspeceRawValue = this.convertDemandeEspeceToDemandeEspeceRawValue({
      ...this.getFormDefaults(),
      ...demandeEspece,
    });
    return new FormGroup<DemandeEspeceFormGroupContent>({
      id: new FormControl(
        { value: demandeEspeceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      montant: new FormControl(demandeEspeceRawValue.montant, {
        validators: [Validators.required],
      }),
      motif: new FormControl(demandeEspeceRawValue.motif, {
        validators: [Validators.required],
      }),
      workOrderId: new FormControl(demandeEspeceRawValue.workOrderId),
      beneficiaireId: new FormControl(demandeEspeceRawValue.beneficiaireId),
      beneficiaireUserLogin: new FormControl(demandeEspeceRawValue.beneficiaireUserLogin),
      createdAt: new FormControl(demandeEspeceRawValue.createdAt),
      updatedAt: new FormControl(demandeEspeceRawValue.updatedAt),
      createdBy: new FormControl(demandeEspeceRawValue.createdBy),
      createdByUserLogin: new FormControl(demandeEspeceRawValue.createdByUserLogin),
      updatedBy: new FormControl(demandeEspeceRawValue.updatedBy),
      updatedByUserLogin: new FormControl(demandeEspeceRawValue.updatedByUserLogin),
    });
  }

  getDemandeEspece(form: DemandeEspeceFormGroup): IDemandeEspece | NewDemandeEspece {
    return this.convertDemandeEspeceRawValueToDemandeEspece(form.getRawValue() as DemandeEspeceFormRawValue | NewDemandeEspeceFormRawValue);
  }

  resetForm(form: DemandeEspeceFormGroup, demandeEspece: DemandeEspeceFormGroupInput): void {
    const demandeEspeceRawValue = this.convertDemandeEspeceToDemandeEspeceRawValue({ ...this.getFormDefaults(), ...demandeEspece });
    form.reset(
      {
        ...demandeEspeceRawValue,
        id: { value: demandeEspeceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): DemandeEspeceFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertDemandeEspeceRawValueToDemandeEspece(
    rawDemandeEspece: DemandeEspeceFormRawValue | NewDemandeEspeceFormRawValue
  ): IDemandeEspece | NewDemandeEspece {
    return {
      ...rawDemandeEspece,
      createdAt: dayjs(rawDemandeEspece.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawDemandeEspece.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertDemandeEspeceToDemandeEspeceRawValue(
    demandeEspece: IDemandeEspece | (Partial<NewDemandeEspece> & DemandeEspeceFormDefaults)
  ): DemandeEspeceFormRawValue | PartialWithRequiredKeyOf<NewDemandeEspeceFormRawValue> {
    return {
      ...demandeEspece,
      createdAt: demandeEspece.createdAt ? demandeEspece.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: demandeEspece.updatedAt ? demandeEspece.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
