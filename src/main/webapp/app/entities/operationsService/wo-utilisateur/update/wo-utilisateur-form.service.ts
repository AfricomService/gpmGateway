import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IWoUtilisateur, NewWoUtilisateur } from '../wo-utilisateur.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IWoUtilisateur for edit and NewWoUtilisateurFormGroupInput for create.
 */
type WoUtilisateurFormGroupInput = IWoUtilisateur | PartialWithRequiredKeyOf<NewWoUtilisateur>;

type WoUtilisateurFormDefaults = Pick<NewWoUtilisateur, 'id'>;

type WoUtilisateurFormGroupContent = {
  id: FormControl<IWoUtilisateur['id'] | NewWoUtilisateur['id']>;
  role: FormControl<IWoUtilisateur['role']>;
  userId: FormControl<IWoUtilisateur['userId']>;
  userLogin: FormControl<IWoUtilisateur['userLogin']>;
  workOrder: FormControl<IWoUtilisateur['workOrder']>;
};

export type WoUtilisateurFormGroup = FormGroup<WoUtilisateurFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class WoUtilisateurFormService {
  createWoUtilisateurFormGroup(woUtilisateur: WoUtilisateurFormGroupInput = { id: null }): WoUtilisateurFormGroup {
    const woUtilisateurRawValue = {
      ...this.getFormDefaults(),
      ...woUtilisateur,
    };
    return new FormGroup<WoUtilisateurFormGroupContent>({
      id: new FormControl(
        { value: woUtilisateurRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      role: new FormControl(woUtilisateurRawValue.role, {
        validators: [Validators.required],
      }),
      userId: new FormControl(woUtilisateurRawValue.userId),
      userLogin: new FormControl(woUtilisateurRawValue.userLogin),
      workOrder: new FormControl(woUtilisateurRawValue.workOrder, {
        validators: [Validators.required],
      }),
    });
  }

  getWoUtilisateur(form: WoUtilisateurFormGroup): IWoUtilisateur | NewWoUtilisateur {
    return form.getRawValue() as IWoUtilisateur | NewWoUtilisateur;
  }

  resetForm(form: WoUtilisateurFormGroup, woUtilisateur: WoUtilisateurFormGroupInput): void {
    const woUtilisateurRawValue = { ...this.getFormDefaults(), ...woUtilisateur };
    form.reset(
      {
        ...woUtilisateurRawValue,
        id: { value: woUtilisateurRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): WoUtilisateurFormDefaults {
    return {
      id: null,
    };
  }
}
