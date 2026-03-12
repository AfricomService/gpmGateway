import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IMatriceFacturation, NewMatriceFacturation } from '../matrice-facturation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMatriceFacturation for edit and NewMatriceFacturationFormGroupInput for create.
 */
type MatriceFacturationFormGroupInput = IMatriceFacturation | PartialWithRequiredKeyOf<NewMatriceFacturation>;

type MatriceFacturationFormDefaults = Pick<NewMatriceFacturation, 'id'>;

type MatriceFacturationFormGroupContent = {
  id: FormControl<IMatriceFacturation['id'] | NewMatriceFacturation['id']>;
  tarifBase: FormControl<IMatriceFacturation['tarifBase']>;
  tarifMissionNuit: FormControl<IMatriceFacturation['tarifMissionNuit']>;
  tarifHebergement: FormControl<IMatriceFacturation['tarifHebergement']>;
  tarifJourFerie: FormControl<IMatriceFacturation['tarifJourFerie']>;
  tarifDimanche: FormControl<IMatriceFacturation['tarifDimanche']>;
  affaire: FormControl<IMatriceFacturation['affaire']>;
  ville: FormControl<IMatriceFacturation['ville']>;
  zone: FormControl<IMatriceFacturation['zone']>;
};

export type MatriceFacturationFormGroup = FormGroup<MatriceFacturationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class MatriceFacturationFormService {
  createMatriceFacturationFormGroup(matriceFacturation: MatriceFacturationFormGroupInput = { id: null }): MatriceFacturationFormGroup {
    const matriceFacturationRawValue = {
      ...this.getFormDefaults(),
      ...matriceFacturation,
    };
    return new FormGroup<MatriceFacturationFormGroupContent>({
      id: new FormControl(
        { value: matriceFacturationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      tarifBase: new FormControl(matriceFacturationRawValue.tarifBase, {
        validators: [Validators.required],
      }),
      tarifMissionNuit: new FormControl(matriceFacturationRawValue.tarifMissionNuit, {
        validators: [Validators.required],
      }),
      tarifHebergement: new FormControl(matriceFacturationRawValue.tarifHebergement, {
        validators: [Validators.required],
      }),
      tarifJourFerie: new FormControl(matriceFacturationRawValue.tarifJourFerie, {
        validators: [Validators.required],
      }),
      tarifDimanche: new FormControl(matriceFacturationRawValue.tarifDimanche, {
        validators: [Validators.required],
      }),
      affaire: new FormControl(matriceFacturationRawValue.affaire, {
        validators: [Validators.required],
      }),
      ville: new FormControl(matriceFacturationRawValue.ville),
      zone: new FormControl(matriceFacturationRawValue.zone),
    });
  }

  getMatriceFacturation(form: MatriceFacturationFormGroup): IMatriceFacturation | NewMatriceFacturation {
    return form.getRawValue() as IMatriceFacturation | NewMatriceFacturation;
  }

  resetForm(form: MatriceFacturationFormGroup, matriceFacturation: MatriceFacturationFormGroupInput): void {
    const matriceFacturationRawValue = { ...this.getFormDefaults(), ...matriceFacturation };
    form.reset(
      {
        ...matriceFacturationRawValue,
        id: { value: matriceFacturationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): MatriceFacturationFormDefaults {
    return {
      id: null,
    };
  }
}
