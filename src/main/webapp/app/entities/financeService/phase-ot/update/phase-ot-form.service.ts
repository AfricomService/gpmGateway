import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPhaseOt, NewPhaseOt } from '../phase-ot.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPhaseOt for edit and NewPhaseOtFormGroupInput for create.
 */
type PhaseOtFormGroupInput = IPhaseOt | PartialWithRequiredKeyOf<NewPhaseOt>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPhaseOt | NewPhaseOt> = Omit<T, 'dateDebut' | 'dl' | 'dlc'> & {
  dateDebut?: string | null;
  dl?: string | null;
  dlc?: string | null;
};

type PhaseOtFormRawValue = FormValueOf<IPhaseOt>;

type NewPhaseOtFormRawValue = FormValueOf<NewPhaseOt>;

type PhaseOtFormDefaults = Pick<NewPhaseOt, 'id' | 'bloquante' | 'dateDebut' | 'dl' | 'dlc'>;

type PhaseOtFormGroupContent = {
  id: FormControl<PhaseOtFormRawValue['id'] | NewPhaseOt['id']>;
  nom: FormControl<PhaseOtFormRawValue['nom']>;
  description: FormControl<PhaseOtFormRawValue['description']>;
  duree: FormControl<PhaseOtFormRawValue['duree']>;
  bloquante: FormControl<PhaseOtFormRawValue['bloquante']>;
  statut: FormControl<PhaseOtFormRawValue['statut']>;
  dateDebut: FormControl<PhaseOtFormRawValue['dateDebut']>;
  dl: FormControl<PhaseOtFormRawValue['dl']>;
  dlc: FormControl<PhaseOtFormRawValue['dlc']>;
  phaseParentId: FormControl<PhaseOtFormRawValue['phaseParentId']>;
};

export type PhaseOtFormGroup = FormGroup<PhaseOtFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PhaseOtFormService {
  createPhaseOtFormGroup(phaseOt: PhaseOtFormGroupInput = { id: null }): PhaseOtFormGroup {
    const phaseOtRawValue = this.convertPhaseOtToPhaseOtRawValue({
      ...this.getFormDefaults(),
      ...phaseOt,
    });
    return new FormGroup<PhaseOtFormGroupContent>({
      id: new FormControl(
        { value: phaseOtRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      nom: new FormControl(phaseOtRawValue.nom),
      description: new FormControl(phaseOtRawValue.description),
      duree: new FormControl(phaseOtRawValue.duree),
      bloquante: new FormControl(phaseOtRawValue.bloquante),
      statut: new FormControl(phaseOtRawValue.statut),
      dateDebut: new FormControl(phaseOtRawValue.dateDebut),
      dl: new FormControl(phaseOtRawValue.dl),
      dlc: new FormControl(phaseOtRawValue.dlc),
      phaseParentId: new FormControl(phaseOtRawValue.phaseParentId),
    });
  }

  getPhaseOt(form: PhaseOtFormGroup): IPhaseOt | NewPhaseOt {
    return this.convertPhaseOtRawValueToPhaseOt(form.getRawValue() as PhaseOtFormRawValue | NewPhaseOtFormRawValue);
  }

  resetForm(form: PhaseOtFormGroup, phaseOt: PhaseOtFormGroupInput): void {
    const phaseOtRawValue = this.convertPhaseOtToPhaseOtRawValue({ ...this.getFormDefaults(), ...phaseOt });
    form.reset(
      {
        ...phaseOtRawValue,
        id: { value: phaseOtRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): PhaseOtFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      bloquante: false,
      dateDebut: currentTime,
      dl: currentTime,
      dlc: currentTime,
    };
  }

  private convertPhaseOtRawValueToPhaseOt(rawPhaseOt: PhaseOtFormRawValue | NewPhaseOtFormRawValue): IPhaseOt | NewPhaseOt {
    return {
      ...rawPhaseOt,
      dateDebut: dayjs(rawPhaseOt.dateDebut, DATE_TIME_FORMAT),
      dl: dayjs(rawPhaseOt.dl, DATE_TIME_FORMAT),
      dlc: dayjs(rawPhaseOt.dlc, DATE_TIME_FORMAT),
    };
  }

  private convertPhaseOtToPhaseOtRawValue(
    phaseOt: IPhaseOt | (Partial<NewPhaseOt> & PhaseOtFormDefaults)
  ): PhaseOtFormRawValue | PartialWithRequiredKeyOf<NewPhaseOtFormRawValue> {
    return {
      ...phaseOt,
      dateDebut: phaseOt.dateDebut ? phaseOt.dateDebut.format(DATE_TIME_FORMAT) : undefined,
      dl: phaseOt.dl ? phaseOt.dl.format(DATE_TIME_FORMAT) : undefined,
      dlc: phaseOt.dlc ? phaseOt.dlc.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
