import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IDemandeAchat, NewDemandeAchat } from '../demande-achat.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDemandeAchat for edit and NewDemandeAchatFormGroupInput for create.
 */
type DemandeAchatFormGroupInput = IDemandeAchat | PartialWithRequiredKeyOf<NewDemandeAchat>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDemandeAchat | NewDemandeAchat> = Omit<T, 'dateCreation' | 'createdAt' | 'updatedAt'> & {
  dateCreation?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type DemandeAchatFormRawValue = FormValueOf<IDemandeAchat>;

type NewDemandeAchatFormRawValue = FormValueOf<NewDemandeAchat>;

type DemandeAchatFormDefaults = Pick<NewDemandeAchat, 'id' | 'dateCreation' | 'createdAt' | 'updatedAt'>;

type DemandeAchatFormGroupContent = {
  id: FormControl<DemandeAchatFormRawValue['id'] | NewDemandeAchat['id']>;
  code: FormControl<DemandeAchatFormRawValue['code']>;
  statut: FormControl<DemandeAchatFormRawValue['statut']>;
  type: FormControl<DemandeAchatFormRawValue['type']>;
  dateCreation: FormControl<DemandeAchatFormRawValue['dateCreation']>;
  dateMiseADisposition: FormControl<DemandeAchatFormRawValue['dateMiseADisposition']>;
  workOrderId: FormControl<DemandeAchatFormRawValue['workOrderId']>;
  affaireId: FormControl<DemandeAchatFormRawValue['affaireId']>;
  demandeurId: FormControl<DemandeAchatFormRawValue['demandeurId']>;
  demandeurUserLogin: FormControl<DemandeAchatFormRawValue['demandeurUserLogin']>;
  validateurId: FormControl<DemandeAchatFormRawValue['validateurId']>;
  validateurUserLogin: FormControl<DemandeAchatFormRawValue['validateurUserLogin']>;
  createdAt: FormControl<DemandeAchatFormRawValue['createdAt']>;
  updatedAt: FormControl<DemandeAchatFormRawValue['updatedAt']>;
  createdBy: FormControl<DemandeAchatFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<DemandeAchatFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<DemandeAchatFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<DemandeAchatFormRawValue['updatedByUserLogin']>;
};

export type DemandeAchatFormGroup = FormGroup<DemandeAchatFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DemandeAchatFormService {
  createDemandeAchatFormGroup(demandeAchat: DemandeAchatFormGroupInput = { id: null }): DemandeAchatFormGroup {
    const demandeAchatRawValue = this.convertDemandeAchatToDemandeAchatRawValue({
      ...this.getFormDefaults(),
      ...demandeAchat,
    });
    return new FormGroup<DemandeAchatFormGroupContent>({
      id: new FormControl(
        { value: demandeAchatRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      code: new FormControl(demandeAchatRawValue.code, {
        validators: [Validators.required],
      }),
      statut: new FormControl(demandeAchatRawValue.statut, {
        validators: [Validators.required],
      }),
      type: new FormControl(demandeAchatRawValue.type, {
        validators: [Validators.required],
      }),
      dateCreation: new FormControl(demandeAchatRawValue.dateCreation, {
        validators: [Validators.required],
      }),
      dateMiseADisposition: new FormControl(demandeAchatRawValue.dateMiseADisposition, {
        validators: [Validators.required],
      }),
      workOrderId: new FormControl(demandeAchatRawValue.workOrderId),
      affaireId: new FormControl(demandeAchatRawValue.affaireId),
      demandeurId: new FormControl(demandeAchatRawValue.demandeurId),
      demandeurUserLogin: new FormControl(demandeAchatRawValue.demandeurUserLogin),
      validateurId: new FormControl(demandeAchatRawValue.validateurId),
      validateurUserLogin: new FormControl(demandeAchatRawValue.validateurUserLogin),
      createdAt: new FormControl(demandeAchatRawValue.createdAt),
      updatedAt: new FormControl(demandeAchatRawValue.updatedAt),
      createdBy: new FormControl(demandeAchatRawValue.createdBy),
      createdByUserLogin: new FormControl(demandeAchatRawValue.createdByUserLogin),
      updatedBy: new FormControl(demandeAchatRawValue.updatedBy),
      updatedByUserLogin: new FormControl(demandeAchatRawValue.updatedByUserLogin),
    });
  }

  getDemandeAchat(form: DemandeAchatFormGroup): IDemandeAchat | NewDemandeAchat {
    return this.convertDemandeAchatRawValueToDemandeAchat(form.getRawValue() as DemandeAchatFormRawValue | NewDemandeAchatFormRawValue);
  }

  resetForm(form: DemandeAchatFormGroup, demandeAchat: DemandeAchatFormGroupInput): void {
    const demandeAchatRawValue = this.convertDemandeAchatToDemandeAchatRawValue({ ...this.getFormDefaults(), ...demandeAchat });
    form.reset(
      {
        ...demandeAchatRawValue,
        id: { value: demandeAchatRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): DemandeAchatFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      dateCreation: currentTime,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertDemandeAchatRawValueToDemandeAchat(
    rawDemandeAchat: DemandeAchatFormRawValue | NewDemandeAchatFormRawValue
  ): IDemandeAchat | NewDemandeAchat {
    return {
      ...rawDemandeAchat,
      dateCreation: dayjs(rawDemandeAchat.dateCreation, DATE_TIME_FORMAT),
      createdAt: dayjs(rawDemandeAchat.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawDemandeAchat.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertDemandeAchatToDemandeAchatRawValue(
    demandeAchat: IDemandeAchat | (Partial<NewDemandeAchat> & DemandeAchatFormDefaults)
  ): DemandeAchatFormRawValue | PartialWithRequiredKeyOf<NewDemandeAchatFormRawValue> {
    return {
      ...demandeAchat,
      dateCreation: demandeAchat.dateCreation ? demandeAchat.dateCreation.format(DATE_TIME_FORMAT) : undefined,
      createdAt: demandeAchat.createdAt ? demandeAchat.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: demandeAchat.updatedAt ? demandeAchat.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
