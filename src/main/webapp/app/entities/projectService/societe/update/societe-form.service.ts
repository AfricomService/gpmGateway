import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ISociete, NewSociete } from '../societe.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISociete for edit and NewSocieteFormGroupInput for create.
 */
type SocieteFormGroupInput = ISociete | PartialWithRequiredKeyOf<NewSociete>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ISociete | NewSociete> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type SocieteFormRawValue = FormValueOf<ISociete>;

type NewSocieteFormRawValue = FormValueOf<NewSociete>;

type SocieteFormDefaults = Pick<NewSociete, 'id' | 'createdAt' | 'updatedAt'>;

type SocieteFormGroupContent = {
  id: FormControl<SocieteFormRawValue['id'] | NewSociete['id']>;
  raisonSociale: FormControl<SocieteFormRawValue['raisonSociale']>;
  raisonSocialeAbrege: FormControl<SocieteFormRawValue['raisonSocialeAbrege']>;
  identifiantUnique: FormControl<SocieteFormRawValue['identifiantUnique']>;
  registreCommerce: FormControl<SocieteFormRawValue['registreCommerce']>;
  codeArticle: FormControl<SocieteFormRawValue['codeArticle']>;
  adresse: FormControl<SocieteFormRawValue['adresse']>;
  codePostal: FormControl<SocieteFormRawValue['codePostal']>;
  pays: FormControl<SocieteFormRawValue['pays']>;
  telephone: FormControl<SocieteFormRawValue['telephone']>;
  fax: FormControl<SocieteFormRawValue['fax']>;
  email: FormControl<SocieteFormRawValue['email']>;
  createdAt: FormControl<SocieteFormRawValue['createdAt']>;
  updatedAt: FormControl<SocieteFormRawValue['updatedAt']>;
  createdBy: FormControl<SocieteFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<SocieteFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<SocieteFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<SocieteFormRawValue['updatedByUserLogin']>;
};

export type SocieteFormGroup = FormGroup<SocieteFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SocieteFormService {
  createSocieteFormGroup(societe: SocieteFormGroupInput = { id: null }): SocieteFormGroup {
    const societeRawValue = this.convertSocieteToSocieteRawValue({
      ...this.getFormDefaults(),
      ...societe,
    });
    return new FormGroup<SocieteFormGroupContent>({
      id: new FormControl(
        { value: societeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      raisonSociale: new FormControl(societeRawValue.raisonSociale, {
        validators: [Validators.required],
      }),
      raisonSocialeAbrege: new FormControl(societeRawValue.raisonSocialeAbrege),
      identifiantUnique: new FormControl(societeRawValue.identifiantUnique, {
        validators: [Validators.required],
      }),
      registreCommerce: new FormControl(societeRawValue.registreCommerce),
      codeArticle: new FormControl(societeRawValue.codeArticle),
      adresse: new FormControl(societeRawValue.adresse, {
        validators: [Validators.required],
      }),
      codePostal: new FormControl(societeRawValue.codePostal),
      pays: new FormControl(societeRawValue.pays, {
        validators: [Validators.required],
      }),
      telephone: new FormControl(societeRawValue.telephone),
      fax: new FormControl(societeRawValue.fax),
      email: new FormControl(societeRawValue.email),
      createdAt: new FormControl(societeRawValue.createdAt),
      updatedAt: new FormControl(societeRawValue.updatedAt),
      createdBy: new FormControl(societeRawValue.createdBy),
      createdByUserLogin: new FormControl(societeRawValue.createdByUserLogin),
      updatedBy: new FormControl(societeRawValue.updatedBy),
      updatedByUserLogin: new FormControl(societeRawValue.updatedByUserLogin),
    });
  }

  getSociete(form: SocieteFormGroup): ISociete | NewSociete {
    return this.convertSocieteRawValueToSociete(form.getRawValue() as SocieteFormRawValue | NewSocieteFormRawValue);
  }

  resetForm(form: SocieteFormGroup, societe: SocieteFormGroupInput): void {
    const societeRawValue = this.convertSocieteToSocieteRawValue({ ...this.getFormDefaults(), ...societe });
    form.reset(
      {
        ...societeRawValue,
        id: { value: societeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): SocieteFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertSocieteRawValueToSociete(rawSociete: SocieteFormRawValue | NewSocieteFormRawValue): ISociete | NewSociete {
    return {
      ...rawSociete,
      createdAt: dayjs(rawSociete.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawSociete.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertSocieteToSocieteRawValue(
    societe: ISociete | (Partial<NewSociete> & SocieteFormDefaults)
  ): SocieteFormRawValue | PartialWithRequiredKeyOf<NewSocieteFormRawValue> {
    return {
      ...societe,
      createdAt: societe.createdAt ? societe.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: societe.updatedAt ? societe.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
