import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IHistoriqueStatutWO, NewHistoriqueStatutWO } from '../historique-statut-wo.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IHistoriqueStatutWO for edit and NewHistoriqueStatutWOFormGroupInput for create.
 */
type HistoriqueStatutWOFormGroupInput = IHistoriqueStatutWO | PartialWithRequiredKeyOf<NewHistoriqueStatutWO>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IHistoriqueStatutWO | NewHistoriqueStatutWO> = Omit<T, 'dateChangement'> & {
  dateChangement?: string | null;
};

type HistoriqueStatutWOFormRawValue = FormValueOf<IHistoriqueStatutWO>;

type NewHistoriqueStatutWOFormRawValue = FormValueOf<NewHistoriqueStatutWO>;

type HistoriqueStatutWOFormDefaults = Pick<NewHistoriqueStatutWO, 'id' | 'dateChangement'>;

type HistoriqueStatutWOFormGroupContent = {
  id: FormControl<HistoriqueStatutWOFormRawValue['id'] | NewHistoriqueStatutWO['id']>;
  ancienStatut: FormControl<HistoriqueStatutWOFormRawValue['ancienStatut']>;
  nouveauStatut: FormControl<HistoriqueStatutWOFormRawValue['nouveauStatut']>;
  dateChangement: FormControl<HistoriqueStatutWOFormRawValue['dateChangement']>;
  commentaire: FormControl<HistoriqueStatutWOFormRawValue['commentaire']>;
  userId: FormControl<HistoriqueStatutWOFormRawValue['userId']>;
  userLogin: FormControl<HistoriqueStatutWOFormRawValue['userLogin']>;
  workOrder: FormControl<HistoriqueStatutWOFormRawValue['workOrder']>;
};

export type HistoriqueStatutWOFormGroup = FormGroup<HistoriqueStatutWOFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class HistoriqueStatutWOFormService {
  createHistoriqueStatutWOFormGroup(historiqueStatutWO: HistoriqueStatutWOFormGroupInput = { id: null }): HistoriqueStatutWOFormGroup {
    const historiqueStatutWORawValue = this.convertHistoriqueStatutWOToHistoriqueStatutWORawValue({
      ...this.getFormDefaults(),
      ...historiqueStatutWO,
    });
    return new FormGroup<HistoriqueStatutWOFormGroupContent>({
      id: new FormControl(
        { value: historiqueStatutWORawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      ancienStatut: new FormControl(historiqueStatutWORawValue.ancienStatut, {
        validators: [Validators.required],
      }),
      nouveauStatut: new FormControl(historiqueStatutWORawValue.nouveauStatut, {
        validators: [Validators.required],
      }),
      dateChangement: new FormControl(historiqueStatutWORawValue.dateChangement, {
        validators: [Validators.required],
      }),
      commentaire: new FormControl(historiqueStatutWORawValue.commentaire),
      userId: new FormControl(historiqueStatutWORawValue.userId),
      userLogin: new FormControl(historiqueStatutWORawValue.userLogin),
      workOrder: new FormControl(historiqueStatutWORawValue.workOrder, {
        validators: [Validators.required],
      }),
    });
  }

  getHistoriqueStatutWO(form: HistoriqueStatutWOFormGroup): IHistoriqueStatutWO | NewHistoriqueStatutWO {
    return this.convertHistoriqueStatutWORawValueToHistoriqueStatutWO(
      form.getRawValue() as HistoriqueStatutWOFormRawValue | NewHistoriqueStatutWOFormRawValue
    );
  }

  resetForm(form: HistoriqueStatutWOFormGroup, historiqueStatutWO: HistoriqueStatutWOFormGroupInput): void {
    const historiqueStatutWORawValue = this.convertHistoriqueStatutWOToHistoriqueStatutWORawValue({
      ...this.getFormDefaults(),
      ...historiqueStatutWO,
    });
    form.reset(
      {
        ...historiqueStatutWORawValue,
        id: { value: historiqueStatutWORawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): HistoriqueStatutWOFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      dateChangement: currentTime,
    };
  }

  private convertHistoriqueStatutWORawValueToHistoriqueStatutWO(
    rawHistoriqueStatutWO: HistoriqueStatutWOFormRawValue | NewHistoriqueStatutWOFormRawValue
  ): IHistoriqueStatutWO | NewHistoriqueStatutWO {
    return {
      ...rawHistoriqueStatutWO,
      dateChangement: dayjs(rawHistoriqueStatutWO.dateChangement, DATE_TIME_FORMAT),
    };
  }

  private convertHistoriqueStatutWOToHistoriqueStatutWORawValue(
    historiqueStatutWO: IHistoriqueStatutWO | (Partial<NewHistoriqueStatutWO> & HistoriqueStatutWOFormDefaults)
  ): HistoriqueStatutWOFormRawValue | PartialWithRequiredKeyOf<NewHistoriqueStatutWOFormRawValue> {
    return {
      ...historiqueStatutWO,
      dateChangement: historiqueStatutWO.dateChangement ? historiqueStatutWO.dateChangement.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
