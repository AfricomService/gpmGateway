import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAffaire, NewAffaire } from '../affaire.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAffaire for edit and NewAffaireFormGroupInput for create.
 */
type AffaireFormGroupInput = IAffaire | PartialWithRequiredKeyOf<NewAffaire>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAffaire | NewAffaire> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AffaireFormRawValue = FormValueOf<IAffaire>;

type NewAffaireFormRawValue = FormValueOf<NewAffaire>;

type AffaireFormDefaults = Pick<NewAffaire, 'id' | 'lieuMultipleParMission' | 'createdAt' | 'updatedAt'>;

type AffaireFormGroupContent = {
  id: FormControl<AffaireFormRawValue['id'] | NewAffaire['id']>;
  numAffaire: FormControl<AffaireFormRawValue['numAffaire']>;
  designationAffaire: FormControl<AffaireFormRawValue['designationAffaire']>;
  bonDeCommande: FormControl<AffaireFormRawValue['bonDeCommande']>;
  montant: FormControl<AffaireFormRawValue['montant']>;
  devise: FormControl<AffaireFormRawValue['devise']>;
  dateDebut: FormControl<AffaireFormRawValue['dateDebut']>;
  dateCloture: FormControl<AffaireFormRawValue['dateCloture']>;
  datePassageExecution: FormControl<AffaireFormRawValue['datePassageExecution']>;
  lieuMultipleParMission: FormControl<AffaireFormRawValue['lieuMultipleParMission']>;
  montantVente: FormControl<AffaireFormRawValue['montantVente']>;
  montantBudgetaireMateriel: FormControl<AffaireFormRawValue['montantBudgetaireMateriel']>;
  montantBudgetaireService: FormControl<AffaireFormRawValue['montantBudgetaireService']>;
  statut: FormControl<AffaireFormRawValue['statut']>;
  responsableProjetId: FormControl<AffaireFormRawValue['responsableProjetId']>;
  responsableProjetUserLogin: FormControl<AffaireFormRawValue['responsableProjetUserLogin']>;
  createdAt: FormControl<AffaireFormRawValue['createdAt']>;
  updatedAt: FormControl<AffaireFormRawValue['updatedAt']>;
  createdBy: FormControl<AffaireFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<AffaireFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<AffaireFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<AffaireFormRawValue['updatedByUserLogin']>;
  client: FormControl<AffaireFormRawValue['client']>;
};

export type AffaireFormGroup = FormGroup<AffaireFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AffaireFormService {
  createAffaireFormGroup(affaire: AffaireFormGroupInput = { id: null }): AffaireFormGroup {
    const affaireRawValue = this.convertAffaireToAffaireRawValue({
      ...this.getFormDefaults(),
      ...affaire,
    });
    return new FormGroup<AffaireFormGroupContent>({
      id: new FormControl(
        { value: affaireRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      numAffaire: new FormControl(affaireRawValue.numAffaire, {
        validators: [Validators.required],
      }),
      designationAffaire: new FormControl(affaireRawValue.designationAffaire, {
        validators: [Validators.required],
      }),
      bonDeCommande: new FormControl(affaireRawValue.bonDeCommande),
      montant: new FormControl(affaireRawValue.montant),
      devise: new FormControl(affaireRawValue.devise),
      dateDebut: new FormControl(affaireRawValue.dateDebut),
      dateCloture: new FormControl(affaireRawValue.dateCloture),
      datePassageExecution: new FormControl(affaireRawValue.datePassageExecution),
      lieuMultipleParMission: new FormControl(affaireRawValue.lieuMultipleParMission),
      montantVente: new FormControl(affaireRawValue.montantVente),
      montantBudgetaireMateriel: new FormControl(affaireRawValue.montantBudgetaireMateriel),
      montantBudgetaireService: new FormControl(affaireRawValue.montantBudgetaireService),
      statut: new FormControl(affaireRawValue.statut, {
        validators: [Validators.required],
      }),
      responsableProjetId: new FormControl(affaireRawValue.responsableProjetId),
      responsableProjetUserLogin: new FormControl(affaireRawValue.responsableProjetUserLogin),
      createdAt: new FormControl(affaireRawValue.createdAt),
      updatedAt: new FormControl(affaireRawValue.updatedAt),
      createdBy: new FormControl(affaireRawValue.createdBy),
      createdByUserLogin: new FormControl(affaireRawValue.createdByUserLogin),
      updatedBy: new FormControl(affaireRawValue.updatedBy),
      updatedByUserLogin: new FormControl(affaireRawValue.updatedByUserLogin),
      client: new FormControl(affaireRawValue.client, {
        validators: [Validators.required],
      }),
    });
  }

  getAffaire(form: AffaireFormGroup): IAffaire | NewAffaire {
    return this.convertAffaireRawValueToAffaire(form.getRawValue() as AffaireFormRawValue | NewAffaireFormRawValue);
  }

  resetForm(form: AffaireFormGroup, affaire: AffaireFormGroupInput): void {
    const affaireRawValue = this.convertAffaireToAffaireRawValue({ ...this.getFormDefaults(), ...affaire });
    form.reset(
      {
        ...affaireRawValue,
        id: { value: affaireRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): AffaireFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      lieuMultipleParMission: false,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertAffaireRawValueToAffaire(rawAffaire: AffaireFormRawValue | NewAffaireFormRawValue): IAffaire | NewAffaire {
    return {
      ...rawAffaire,
      createdAt: dayjs(rawAffaire.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawAffaire.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertAffaireToAffaireRawValue(
    affaire: IAffaire | (Partial<NewAffaire> & AffaireFormDefaults)
  ): AffaireFormRawValue | PartialWithRequiredKeyOf<NewAffaireFormRawValue> {
    return {
      ...affaire,
      createdAt: affaire.createdAt ? affaire.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: affaire.updatedAt ? affaire.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
