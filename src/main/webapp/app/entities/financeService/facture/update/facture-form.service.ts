import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFacture, NewFacture } from '../facture.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFacture for edit and NewFactureFormGroupInput for create.
 */
type FactureFormGroupInput = IFacture | PartialWithRequiredKeyOf<NewFacture>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IFacture | NewFacture> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type FactureFormRawValue = FormValueOf<IFacture>;

type NewFactureFormRawValue = FormValueOf<NewFacture>;

type FactureFormDefaults = Pick<NewFacture, 'id' | 'createdAt' | 'updatedAt'>;

type FactureFormGroupContent = {
  id: FormControl<FactureFormRawValue['id'] | NewFacture['id']>;
  numFacture: FormControl<FactureFormRawValue['numFacture']>;
  bonDeCommande: FormControl<FactureFormRawValue['bonDeCommande']>;
  montantFacture: FormControl<FactureFormRawValue['montantFacture']>;
  dateFacture: FormControl<FactureFormRawValue['dateFacture']>;
  dateEcheance: FormControl<FactureFormRawValue['dateEcheance']>;
  dateDecharge: FormControl<FactureFormRawValue['dateDecharge']>;
  statut: FormControl<FactureFormRawValue['statut']>;
  clientId: FormControl<FactureFormRawValue['clientId']>;
  createdAt: FormControl<FactureFormRawValue['createdAt']>;
  updatedAt: FormControl<FactureFormRawValue['updatedAt']>;
  createdBy: FormControl<FactureFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<FactureFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<FactureFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<FactureFormRawValue['updatedByUserLogin']>;
};

export type FactureFormGroup = FormGroup<FactureFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FactureFormService {
  createFactureFormGroup(facture: FactureFormGroupInput = { id: null }): FactureFormGroup {
    const factureRawValue = this.convertFactureToFactureRawValue({
      ...this.getFormDefaults(),
      ...facture,
    });
    return new FormGroup<FactureFormGroupContent>({
      id: new FormControl(
        { value: factureRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      numFacture: new FormControl(factureRawValue.numFacture, {
        validators: [Validators.required],
      }),
      bonDeCommande: new FormControl(factureRawValue.bonDeCommande),
      montantFacture: new FormControl(factureRawValue.montantFacture, {
        validators: [Validators.required],
      }),
      dateFacture: new FormControl(factureRawValue.dateFacture, {
        validators: [Validators.required],
      }),
      dateEcheance: new FormControl(factureRawValue.dateEcheance),
      dateDecharge: new FormControl(factureRawValue.dateDecharge),
      statut: new FormControl(factureRawValue.statut, {
        validators: [Validators.required],
      }),
      clientId: new FormControl(factureRawValue.clientId),
      createdAt: new FormControl(factureRawValue.createdAt),
      updatedAt: new FormControl(factureRawValue.updatedAt),
      createdBy: new FormControl(factureRawValue.createdBy),
      createdByUserLogin: new FormControl(factureRawValue.createdByUserLogin),
      updatedBy: new FormControl(factureRawValue.updatedBy),
      updatedByUserLogin: new FormControl(factureRawValue.updatedByUserLogin),
    });
  }

  getFacture(form: FactureFormGroup): IFacture | NewFacture {
    return this.convertFactureRawValueToFacture(form.getRawValue() as FactureFormRawValue | NewFactureFormRawValue);
  }

  resetForm(form: FactureFormGroup, facture: FactureFormGroupInput): void {
    const factureRawValue = this.convertFactureToFactureRawValue({ ...this.getFormDefaults(), ...facture });
    form.reset(
      {
        ...factureRawValue,
        id: { value: factureRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): FactureFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertFactureRawValueToFacture(rawFacture: FactureFormRawValue | NewFactureFormRawValue): IFacture | NewFacture {
    return {
      ...rawFacture,
      createdAt: dayjs(rawFacture.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawFacture.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertFactureToFactureRawValue(
    facture: IFacture | (Partial<NewFacture> & FactureFormDefaults)
  ): FactureFormRawValue | PartialWithRequiredKeyOf<NewFactureFormRawValue> {
    return {
      ...facture,
      createdAt: facture.createdAt ? facture.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: facture.updatedAt ? facture.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
