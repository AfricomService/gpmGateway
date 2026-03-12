import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFraisDeMission, NewFraisDeMission } from '../frais-de-mission.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFraisDeMission for edit and NewFraisDeMissionFormGroupInput for create.
 */
type FraisDeMissionFormGroupInput = IFraisDeMission | PartialWithRequiredKeyOf<NewFraisDeMission>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IFraisDeMission | NewFraisDeMission> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type FraisDeMissionFormRawValue = FormValueOf<IFraisDeMission>;

type NewFraisDeMissionFormRawValue = FormValueOf<NewFraisDeMission>;

type FraisDeMissionFormDefaults = Pick<NewFraisDeMission, 'id' | 'createdAt' | 'updatedAt'>;

type FraisDeMissionFormGroupContent = {
  id: FormControl<FraisDeMissionFormRawValue['id'] | NewFraisDeMission['id']>;
  dateDebut: FormControl<FraisDeMissionFormRawValue['dateDebut']>;
  dateFin: FormControl<FraisDeMissionFormRawValue['dateFin']>;
  montantTotal: FormControl<FraisDeMissionFormRawValue['montantTotal']>;
  avanceRecue: FormControl<FraisDeMissionFormRawValue['avanceRecue']>;
  netAPayer: FormControl<FraisDeMissionFormRawValue['netAPayer']>;
  noteRendement: FormControl<FraisDeMissionFormRawValue['noteRendement']>;
  noteQualite: FormControl<FraisDeMissionFormRawValue['noteQualite']>;
  noteConduite: FormControl<FraisDeMissionFormRawValue['noteConduite']>;
  noteTotale: FormControl<FraisDeMissionFormRawValue['noteTotale']>;
  bonusExtra: FormControl<FraisDeMissionFormRawValue['bonusExtra']>;
  justificatifBonus: FormControl<FraisDeMissionFormRawValue['justificatifBonus']>;
  justificatifModification: FormControl<FraisDeMissionFormRawValue['justificatifModification']>;
  statut: FormControl<FraisDeMissionFormRawValue['statut']>;
  workOrderId: FormControl<FraisDeMissionFormRawValue['workOrderId']>;
  beneficiaireId: FormControl<FraisDeMissionFormRawValue['beneficiaireId']>;
  beneficiaireUserLogin: FormControl<FraisDeMissionFormRawValue['beneficiaireUserLogin']>;
  createdAt: FormControl<FraisDeMissionFormRawValue['createdAt']>;
  updatedAt: FormControl<FraisDeMissionFormRawValue['updatedAt']>;
  createdBy: FormControl<FraisDeMissionFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<FraisDeMissionFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<FraisDeMissionFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<FraisDeMissionFormRawValue['updatedByUserLogin']>;
};

export type FraisDeMissionFormGroup = FormGroup<FraisDeMissionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FraisDeMissionFormService {
  createFraisDeMissionFormGroup(fraisDeMission: FraisDeMissionFormGroupInput = { id: null }): FraisDeMissionFormGroup {
    const fraisDeMissionRawValue = this.convertFraisDeMissionToFraisDeMissionRawValue({
      ...this.getFormDefaults(),
      ...fraisDeMission,
    });
    return new FormGroup<FraisDeMissionFormGroupContent>({
      id: new FormControl(
        { value: fraisDeMissionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      dateDebut: new FormControl(fraisDeMissionRawValue.dateDebut, {
        validators: [Validators.required],
      }),
      dateFin: new FormControl(fraisDeMissionRawValue.dateFin, {
        validators: [Validators.required],
      }),
      montantTotal: new FormControl(fraisDeMissionRawValue.montantTotal, {
        validators: [Validators.required],
      }),
      avanceRecue: new FormControl(fraisDeMissionRawValue.avanceRecue),
      netAPayer: new FormControl(fraisDeMissionRawValue.netAPayer, {
        validators: [Validators.required],
      }),
      noteRendement: new FormControl(fraisDeMissionRawValue.noteRendement),
      noteQualite: new FormControl(fraisDeMissionRawValue.noteQualite),
      noteConduite: new FormControl(fraisDeMissionRawValue.noteConduite),
      noteTotale: new FormControl(fraisDeMissionRawValue.noteTotale),
      bonusExtra: new FormControl(fraisDeMissionRawValue.bonusExtra),
      justificatifBonus: new FormControl(fraisDeMissionRawValue.justificatifBonus),
      justificatifModification: new FormControl(fraisDeMissionRawValue.justificatifModification),
      statut: new FormControl(fraisDeMissionRawValue.statut, {
        validators: [Validators.required],
      }),
      workOrderId: new FormControl(fraisDeMissionRawValue.workOrderId),
      beneficiaireId: new FormControl(fraisDeMissionRawValue.beneficiaireId),
      beneficiaireUserLogin: new FormControl(fraisDeMissionRawValue.beneficiaireUserLogin),
      createdAt: new FormControl(fraisDeMissionRawValue.createdAt),
      updatedAt: new FormControl(fraisDeMissionRawValue.updatedAt),
      createdBy: new FormControl(fraisDeMissionRawValue.createdBy),
      createdByUserLogin: new FormControl(fraisDeMissionRawValue.createdByUserLogin),
      updatedBy: new FormControl(fraisDeMissionRawValue.updatedBy),
      updatedByUserLogin: new FormControl(fraisDeMissionRawValue.updatedByUserLogin),
    });
  }

  getFraisDeMission(form: FraisDeMissionFormGroup): IFraisDeMission | NewFraisDeMission {
    return this.convertFraisDeMissionRawValueToFraisDeMission(
      form.getRawValue() as FraisDeMissionFormRawValue | NewFraisDeMissionFormRawValue
    );
  }

  resetForm(form: FraisDeMissionFormGroup, fraisDeMission: FraisDeMissionFormGroupInput): void {
    const fraisDeMissionRawValue = this.convertFraisDeMissionToFraisDeMissionRawValue({ ...this.getFormDefaults(), ...fraisDeMission });
    form.reset(
      {
        ...fraisDeMissionRawValue,
        id: { value: fraisDeMissionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): FraisDeMissionFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertFraisDeMissionRawValueToFraisDeMission(
    rawFraisDeMission: FraisDeMissionFormRawValue | NewFraisDeMissionFormRawValue
  ): IFraisDeMission | NewFraisDeMission {
    return {
      ...rawFraisDeMission,
      createdAt: dayjs(rawFraisDeMission.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawFraisDeMission.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertFraisDeMissionToFraisDeMissionRawValue(
    fraisDeMission: IFraisDeMission | (Partial<NewFraisDeMission> & FraisDeMissionFormDefaults)
  ): FraisDeMissionFormRawValue | PartialWithRequiredKeyOf<NewFraisDeMissionFormRawValue> {
    return {
      ...fraisDeMission,
      createdAt: fraisDeMission.createdAt ? fraisDeMission.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: fraisDeMission.updatedAt ? fraisDeMission.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
