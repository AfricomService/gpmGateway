import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';
import { INoteFrais, NewNoteFrais } from '../note-frais.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts INoteFrais for edit and NewNoteFraisFormGroupInput for create.
 */
type NoteFraisFormGroupInput = INoteFrais | PartialWithRequiredKeyOf<NewNoteFrais>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends INoteFrais | NewNoteFrais> = Omit<T, 'dateDebut' | 'dateFin'> & {
  dateDebut?: string | null;
  dateFin?: string | null;
};

type NoteFraisFormRawValue = FormValueOf<INoteFrais>;

type NewNoteFraisFormRawValue = FormValueOf<NewNoteFrais>;

type NoteFraisFormDefaults = Pick<NewNoteFrais, 'id' | 'dateDebut' | 'dateFin'>;

type NoteFraisFormGroupContent = {
  id: FormControl<NoteFraisFormRawValue['id'] | NewNoteFrais['id']>;
  dateDebut: FormControl<NoteFraisFormRawValue['dateDebut']>;
  dateFin: FormControl<NoteFraisFormRawValue['dateFin']>;
  contactSocieteId: FormControl<NoteFraisFormRawValue['contactSocieteId']>;
  montantTotale: FormControl<NoteFraisFormRawValue['montantTotale']>;
  montantTotaleEnLettre: FormControl<NoteFraisFormRawValue['montantTotaleEnLettre']>;
};

export type NoteFraisFormGroup = FormGroup<NoteFraisFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class NoteFraisFormService {
  createNoteFraisFormGroup(noteFrais: NoteFraisFormGroupInput = { id: null }): NoteFraisFormGroup {
    const noteFraisRawValue = this.convertNoteFraisToNoteFraisRawValue({
      ...this.getFormDefaults(),
      ...noteFrais,
    });
    return new FormGroup<NoteFraisFormGroupContent>({
      id: new FormControl(
        { value: noteFraisRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      dateDebut: new FormControl(noteFraisRawValue.dateDebut),
      dateFin: new FormControl(noteFraisRawValue.dateFin),
      contactSocieteId: new FormControl(noteFraisRawValue.contactSocieteId),
      montantTotale: new FormControl(noteFraisRawValue.montantTotale),
      montantTotaleEnLettre: new FormControl(noteFraisRawValue.montantTotaleEnLettre),
    });
  }

  getNoteFrais(form: NoteFraisFormGroup): INoteFrais | NewNoteFrais {
    return this.convertNoteFraisRawValueToNoteFrais(form.getRawValue() as NoteFraisFormRawValue | NewNoteFraisFormRawValue);
  }

  resetForm(form: NoteFraisFormGroup, noteFrais: NoteFraisFormGroupInput): void {
    const noteFraisRawValue = this.convertNoteFraisToNoteFraisRawValue({ ...this.getFormDefaults(), ...noteFrais });
    form.reset(
      {
        ...noteFraisRawValue,
        id: { value: noteFraisRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): NoteFraisFormDefaults {
    const moisDernier = dayjs().subtract(1, 'month');

    return {
      id: null,
      dateDebut: moisDernier.startOf('month'),
      dateFin: moisDernier.endOf('month'),
    };
  }

  private convertNoteFraisRawValueToNoteFrais(rawNoteFrais: NoteFraisFormRawValue | NewNoteFraisFormRawValue): INoteFrais | NewNoteFrais {
    return {
      ...rawNoteFrais,
      dateDebut: dayjs(rawNoteFrais.dateDebut, DATE_FORMAT).startOf('day'),
      dateFin: dayjs(rawNoteFrais.dateFin, DATE_FORMAT).endOf('day'),
    };
  }

  private convertNoteFraisToNoteFraisRawValue(
    noteFrais: INoteFrais | (Partial<NewNoteFrais> & NoteFraisFormDefaults)
  ): NoteFraisFormRawValue | PartialWithRequiredKeyOf<NewNoteFraisFormRawValue> {
    return {
      ...noteFrais,
      dateDebut: noteFrais.dateDebut ? noteFrais.dateDebut.format(DATE_FORMAT) : undefined,
      dateFin: noteFrais.dateFin ? noteFrais.dateFin.format(DATE_FORMAT) : undefined,
    };
  }
}
