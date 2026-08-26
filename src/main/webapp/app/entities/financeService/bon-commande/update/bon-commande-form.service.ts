import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IBonCommande, NewBonCommande } from '../bon-commande.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IBonCommande for edit and NewBonCommandeFormGroupInput for create.
 */
type BonCommandeFormGroupInput = IBonCommande | PartialWithRequiredKeyOf<NewBonCommande>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IBonCommande | NewBonCommande> = Omit<T, 'dateBonCommande'> & {
  dateBonCommande?: string | null;
};

type BonCommandeFormRawValue = FormValueOf<IBonCommande>;

type NewBonCommandeFormRawValue = FormValueOf<NewBonCommande>;

type BonCommandeFormDefaults = Pick<NewBonCommande, 'id' | 'dateBonCommande'>;

type BonCommandeFormGroupContent = {
  id: FormControl<BonCommandeFormRawValue['id'] | NewBonCommande['id']>;
  clientId: FormControl<BonCommandeFormRawValue['clientId']>;
  affaireId: FormControl<BonCommandeFormRawValue['affaireId']>;
  lieu: FormControl<BonCommandeFormRawValue['lieu']>;
  responsableId: FormControl<BonCommandeFormRawValue['responsableId']>;
  referenceClient: FormControl<BonCommandeFormRawValue['referenceClient']>;
  dateBonCommande: FormControl<BonCommandeFormRawValue['dateBonCommande']>;
  montantTotal: FormControl<BonCommandeFormRawValue['montantTotal']>;
  montantCommande: FormControl<BonCommandeFormRawValue['montantCommande']>;
  montantConsomme: FormControl<BonCommandeFormRawValue['montantConsomme']>;
  montantMissionEffectue: FormControl<BonCommandeFormRawValue['montantMissionEffectue']>;
};

export type BonCommandeFormGroup = FormGroup<BonCommandeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class BonCommandeFormService {
  createBonCommandeFormGroup(bonCommande: BonCommandeFormGroupInput = { id: null }): BonCommandeFormGroup {
    const bonCommandeRawValue = this.convertBonCommandeToBonCommandeRawValue({
      ...this.getFormDefaults(),
      ...bonCommande,
    });
    return new FormGroup<BonCommandeFormGroupContent>({
      id: new FormControl(
        { value: bonCommandeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      clientId: new FormControl(bonCommandeRawValue.clientId),
      affaireId: new FormControl(bonCommandeRawValue.affaireId),
      lieu: new FormControl(bonCommandeRawValue.lieu),
      responsableId: new FormControl(bonCommandeRawValue.responsableId),
      referenceClient: new FormControl(bonCommandeRawValue.referenceClient),
      dateBonCommande: new FormControl(bonCommandeRawValue.dateBonCommande),
      montantTotal: new FormControl(bonCommandeRawValue.montantTotal),
      montantCommande: new FormControl(bonCommandeRawValue.montantCommande),
      montantConsomme: new FormControl(bonCommandeRawValue.montantConsomme),
      montantMissionEffectue: new FormControl(bonCommandeRawValue.montantMissionEffectue),
    });
  }

  getBonCommande(form: BonCommandeFormGroup): IBonCommande | NewBonCommande {
    return this.convertBonCommandeRawValueToBonCommande(form.getRawValue() as BonCommandeFormRawValue | NewBonCommandeFormRawValue);
  }

  resetForm(form: BonCommandeFormGroup, bonCommande: BonCommandeFormGroupInput): void {
    const bonCommandeRawValue = this.convertBonCommandeToBonCommandeRawValue({ ...this.getFormDefaults(), ...bonCommande });
    form.reset(
      {
        ...bonCommandeRawValue,
        id: { value: bonCommandeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): BonCommandeFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      dateBonCommande: currentTime,
    };
  }

  private convertBonCommandeRawValueToBonCommande(
    rawBonCommande: BonCommandeFormRawValue | NewBonCommandeFormRawValue
  ): IBonCommande | NewBonCommande {
    return {
      ...rawBonCommande,
      dateBonCommande: dayjs(rawBonCommande.dateBonCommande, DATE_TIME_FORMAT),
    };
  }

  private convertBonCommandeToBonCommandeRawValue(
    bonCommande: IBonCommande | (Partial<NewBonCommande> & BonCommandeFormDefaults)
  ): BonCommandeFormRawValue | PartialWithRequiredKeyOf<NewBonCommandeFormRawValue> {
    return {
      ...bonCommande,
      dateBonCommande: bonCommande.dateBonCommande ? bonCommande.dateBonCommande.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
