import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IMatriceJourFerie, NewMatriceJourFerie } from '../matrice-jour-ferie.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMatriceJourFerie for edit and NewMatriceJourFerieFormGroupInput for create.
 */
type MatriceJourFerieFormGroupInput = IMatriceJourFerie | PartialWithRequiredKeyOf<NewMatriceJourFerie>;

type MatriceJourFerieFormDefaults = Pick<NewMatriceJourFerie, 'id'>;

type MatriceJourFerieFormGroupContent = {
  id: FormControl<IMatriceJourFerie['id'] | NewMatriceJourFerie['id']>;
  tarifApplique: FormControl<IMatriceJourFerie['tarifApplique']>;
  matrice: FormControl<IMatriceJourFerie['matrice']>;
  jourFerie: FormControl<IMatriceJourFerie['jourFerie']>;
};

export type MatriceJourFerieFormGroup = FormGroup<MatriceJourFerieFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class MatriceJourFerieFormService {
  createMatriceJourFerieFormGroup(matriceJourFerie: MatriceJourFerieFormGroupInput = { id: null }): MatriceJourFerieFormGroup {
    const matriceJourFerieRawValue = {
      ...this.getFormDefaults(),
      ...matriceJourFerie,
    };
    return new FormGroup<MatriceJourFerieFormGroupContent>({
      id: new FormControl(
        { value: matriceJourFerieRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tarifApplique: new FormControl(matriceJourFerieRawValue.tarifApplique, {
        validators: [Validators.required],
      }),
      matrice: new FormControl(matriceJourFerieRawValue.matrice, {
        validators: [Validators.required],
      }),
      jourFerie: new FormControl(matriceJourFerieRawValue.jourFerie, {
        validators: [Validators.required],
      }),
    });
  }

  getMatriceJourFerie(form: MatriceJourFerieFormGroup): IMatriceJourFerie | NewMatriceJourFerie {
    return form.getRawValue() as IMatriceJourFerie | NewMatriceJourFerie;
  }

  resetForm(form: MatriceJourFerieFormGroup, matriceJourFerie: MatriceJourFerieFormGroupInput): void {
    const matriceJourFerieRawValue = { ...this.getFormDefaults(), ...matriceJourFerie };
    form.reset(
      {
        ...matriceJourFerieRawValue,
        id: { value: matriceJourFerieRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): MatriceJourFerieFormDefaults {
    return {
      id: null,
    };
  }
}
