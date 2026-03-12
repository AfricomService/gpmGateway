import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IJourFerie, NewJourFerie } from '../jour-ferie.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IJourFerie for edit and NewJourFerieFormGroupInput for create.
 */
type JourFerieFormGroupInput = IJourFerie | PartialWithRequiredKeyOf<NewJourFerie>;

type JourFerieFormDefaults = Pick<NewJourFerie, 'id'>;

type JourFerieFormGroupContent = {
  id: FormControl<IJourFerie['id'] | NewJourFerie['id']>;
  date: FormControl<IJourFerie['date']>;
  designation: FormControl<IJourFerie['designation']>;
  annee: FormControl<IJourFerie['annee']>;
};

export type JourFerieFormGroup = FormGroup<JourFerieFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class JourFerieFormService {
  createJourFerieFormGroup(jourFerie: JourFerieFormGroupInput = { id: null }): JourFerieFormGroup {
    const jourFerieRawValue = {
      ...this.getFormDefaults(),
      ...jourFerie,
    };
    return new FormGroup<JourFerieFormGroupContent>({
      id: new FormControl(
        { value: jourFerieRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      date: new FormControl(jourFerieRawValue.date, {
        validators: [Validators.required],
      }),
      designation: new FormControl(jourFerieRawValue.designation, {
        validators: [Validators.required],
      }),
      annee: new FormControl(jourFerieRawValue.annee, {
        validators: [Validators.required],
      }),
    });
  }

  getJourFerie(form: JourFerieFormGroup): IJourFerie | NewJourFerie {
    return form.getRawValue() as IJourFerie | NewJourFerie;
  }

  resetForm(form: JourFerieFormGroup, jourFerie: JourFerieFormGroupInput): void {
    const jourFerieRawValue = { ...this.getFormDefaults(), ...jourFerie };
    form.reset(
      {
        ...jourFerieRawValue,
        id: { value: jourFerieRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): JourFerieFormDefaults {
    return {
      id: null,
    };
  }
}
