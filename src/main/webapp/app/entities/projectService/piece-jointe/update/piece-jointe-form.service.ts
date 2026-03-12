import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPieceJointe, NewPieceJointe } from '../piece-jointe.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPieceJointe for edit and NewPieceJointeFormGroupInput for create.
 */
type PieceJointeFormGroupInput = IPieceJointe | PartialWithRequiredKeyOf<NewPieceJointe>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPieceJointe | NewPieceJointe> = Omit<T, 'dateUpload'> & {
  dateUpload?: string | null;
};

type PieceJointeFormRawValue = FormValueOf<IPieceJointe>;

type NewPieceJointeFormRawValue = FormValueOf<NewPieceJointe>;

type PieceJointeFormDefaults = Pick<NewPieceJointe, 'id' | 'dateUpload'>;

type PieceJointeFormGroupContent = {
  id: FormControl<PieceJointeFormRawValue['id'] | NewPieceJointe['id']>;
  nomFichier: FormControl<PieceJointeFormRawValue['nomFichier']>;
  type: FormControl<PieceJointeFormRawValue['type']>;
  fichierURL: FormControl<PieceJointeFormRawValue['fichierURL']>;
  dateUpload: FormControl<PieceJointeFormRawValue['dateUpload']>;
  workOrderId: FormControl<PieceJointeFormRawValue['workOrderId']>;
  affaire: FormControl<PieceJointeFormRawValue['affaire']>;
};

export type PieceJointeFormGroup = FormGroup<PieceJointeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PieceJointeFormService {
  createPieceJointeFormGroup(pieceJointe: PieceJointeFormGroupInput = { id: null }): PieceJointeFormGroup {
    const pieceJointeRawValue = this.convertPieceJointeToPieceJointeRawValue({
      ...this.getFormDefaults(),
      ...pieceJointe,
    });
    return new FormGroup<PieceJointeFormGroupContent>({
      id: new FormControl(
        { value: pieceJointeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      nomFichier: new FormControl(pieceJointeRawValue.nomFichier, {
        validators: [Validators.required],
      }),
      type: new FormControl(pieceJointeRawValue.type, {
        validators: [Validators.required],
      }),
      fichierURL: new FormControl(pieceJointeRawValue.fichierURL, {
        validators: [Validators.required],
      }),
      dateUpload: new FormControl(pieceJointeRawValue.dateUpload, {
        validators: [Validators.required],
      }),
      workOrderId: new FormControl(pieceJointeRawValue.workOrderId),
      affaire: new FormControl(pieceJointeRawValue.affaire),
    });
  }

  getPieceJointe(form: PieceJointeFormGroup): IPieceJointe | NewPieceJointe {
    return this.convertPieceJointeRawValueToPieceJointe(form.getRawValue() as PieceJointeFormRawValue | NewPieceJointeFormRawValue);
  }

  resetForm(form: PieceJointeFormGroup, pieceJointe: PieceJointeFormGroupInput): void {
    const pieceJointeRawValue = this.convertPieceJointeToPieceJointeRawValue({ ...this.getFormDefaults(), ...pieceJointe });
    form.reset(
      {
        ...pieceJointeRawValue,
        id: { value: pieceJointeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): PieceJointeFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      dateUpload: currentTime,
    };
  }

  private convertPieceJointeRawValueToPieceJointe(
    rawPieceJointe: PieceJointeFormRawValue | NewPieceJointeFormRawValue
  ): IPieceJointe | NewPieceJointe {
    return {
      ...rawPieceJointe,
      dateUpload: dayjs(rawPieceJointe.dateUpload, DATE_TIME_FORMAT),
    };
  }

  private convertPieceJointeToPieceJointeRawValue(
    pieceJointe: IPieceJointe | (Partial<NewPieceJointe> & PieceJointeFormDefaults)
  ): PieceJointeFormRawValue | PartialWithRequiredKeyOf<NewPieceJointeFormRawValue> {
    return {
      ...pieceJointe,
      dateUpload: pieceJointe.dateUpload ? pieceJointe.dateUpload.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
