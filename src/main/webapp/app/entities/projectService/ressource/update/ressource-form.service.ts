import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IRessource, NewRessource } from '../ressource.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IRessource for edit and NewRessourceFormGroupInput for create.
 */
type RessourceFormGroupInput = IRessource | PartialWithRequiredKeyOf<NewRessource>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IRessource | NewRessource> = Omit<
  T,
  'dateMiseEnService' | 'dateDerniereMaintenance' | 'dateProchaineMaintenance'
> & {
  dateMiseEnService?: string | null;
  dateDerniereMaintenance?: string | null;
  dateProchaineMaintenance?: string | null;
};

type RessourceFormRawValue = FormValueOf<IRessource>;

type NewRessourceFormRawValue = FormValueOf<NewRessource>;

type RessourceFormDefaults = Pick<NewRessource, 'id' | 'dateMiseEnService' | 'dateDerniereMaintenance' | 'dateProchaineMaintenance'>;

type RessourceFormGroupContent = {
  id: FormControl<RessourceFormRawValue['id'] | NewRessource['id']>;
  nom: FormControl<RessourceFormRawValue['nom']>;
  code: FormControl<RessourceFormRawValue['code']>;
  categorie: FormControl<RessourceFormRawValue['categorie']>;
  description: FormControl<RessourceFormRawValue['description']>;
  dateMiseEnService: FormControl<RessourceFormRawValue['dateMiseEnService']>;
  dateDerniereMaintenance: FormControl<RessourceFormRawValue['dateDerniereMaintenance']>;
  dateProchaineMaintenance: FormControl<RessourceFormRawValue['dateProchaineMaintenance']>;
  typeRessourceId: FormControl<RessourceFormRawValue['typeRessourceId']>;
  statut: FormControl<RessourceFormRawValue['statut']>;
};

export type RessourceFormGroup = FormGroup<RessourceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RessourceFormService {
  createRessourceFormGroup(ressource: RessourceFormGroupInput = { id: null }): RessourceFormGroup {
    const ressourceRawValue = this.convertRessourceToRessourceRawValue({
      ...this.getFormDefaults(),
      ...ressource,
    });
    return new FormGroup<RessourceFormGroupContent>({
      id: new FormControl(
        { value: ressourceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      nom: new FormControl(ressourceRawValue.nom),
      code: new FormControl(ressourceRawValue.code),
      categorie: new FormControl(ressourceRawValue.categorie),
      description: new FormControl(ressourceRawValue.description),
      dateMiseEnService: new FormControl(ressourceRawValue.dateMiseEnService),
      dateDerniereMaintenance: new FormControl(ressourceRawValue.dateDerniereMaintenance),
      dateProchaineMaintenance: new FormControl(ressourceRawValue.dateProchaineMaintenance),
      typeRessourceId: new FormControl(ressourceRawValue.typeRessourceId),
      statut: new FormControl(ressourceRawValue.statut),
    });
  }

  getRessource(form: RessourceFormGroup): IRessource | NewRessource {
    return this.convertRessourceRawValueToRessource(form.getRawValue() as RessourceFormRawValue | NewRessourceFormRawValue);
  }

  resetForm(form: RessourceFormGroup, ressource: RessourceFormGroupInput): void {
    const ressourceRawValue = this.convertRessourceToRessourceRawValue({ ...this.getFormDefaults(), ...ressource });
    form.reset(
      {
        ...ressourceRawValue,
        id: { value: ressourceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): RessourceFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      dateMiseEnService: currentTime,
      dateDerniereMaintenance: currentTime,
      dateProchaineMaintenance: currentTime,
    };
  }

  private convertRessourceRawValueToRessource(rawRessource: RessourceFormRawValue | NewRessourceFormRawValue): IRessource | NewRessource {
    return {
      ...rawRessource,
      dateMiseEnService: dayjs(rawRessource.dateMiseEnService, DATE_TIME_FORMAT),
      dateDerniereMaintenance: dayjs(rawRessource.dateDerniereMaintenance, DATE_TIME_FORMAT),
      dateProchaineMaintenance: dayjs(rawRessource.dateProchaineMaintenance, DATE_TIME_FORMAT),
    };
  }

  private convertRessourceToRessourceRawValue(
    ressource: IRessource | (Partial<NewRessource> & RessourceFormDefaults)
  ): RessourceFormRawValue | PartialWithRequiredKeyOf<NewRessourceFormRawValue> {
    return {
      ...ressource,
      dateMiseEnService: ressource.dateMiseEnService ? ressource.dateMiseEnService.format(DATE_TIME_FORMAT) : undefined,
      dateDerniereMaintenance: ressource.dateDerniereMaintenance ? ressource.dateDerniereMaintenance.format(DATE_TIME_FORMAT) : undefined,
      dateProchaineMaintenance: ressource.dateProchaineMaintenance
        ? ressource.dateProchaineMaintenance.format(DATE_TIME_FORMAT)
        : undefined,
    };
  }
}
