import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IWoSite, NewWoSite } from '../wo-site.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IWoSite for edit and NewWoSiteFormGroupInput for create.
 */
type WoSiteFormGroupInput = IWoSite | PartialWithRequiredKeyOf<NewWoSite>;

type WoSiteFormDefaults = Pick<NewWoSite, 'id'>;

type WoSiteFormGroupContent = {
  id: FormControl<IWoSite['id'] | NewWoSite['id']>;
  siteCode: FormControl<IWoSite['siteCode']>;
  workOrder: FormControl<IWoSite['workOrder']>;
};

export type WoSiteFormGroup = FormGroup<WoSiteFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class WoSiteFormService {
  createWoSiteFormGroup(woSite: WoSiteFormGroupInput = { id: null }): WoSiteFormGroup {
    const woSiteRawValue = {
      ...this.getFormDefaults(),
      ...woSite,
    };
    return new FormGroup<WoSiteFormGroupContent>({
      id: new FormControl(
        { value: woSiteRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      siteCode: new FormControl(woSiteRawValue.siteCode),
      workOrder: new FormControl(woSiteRawValue.workOrder, {
        validators: [Validators.required],
      }),
    });
  }

  getWoSite(form: WoSiteFormGroup): IWoSite | NewWoSite {
    return form.getRawValue() as IWoSite | NewWoSite;
  }

  resetForm(form: WoSiteFormGroup, woSite: WoSiteFormGroupInput): void {
    const woSiteRawValue = { ...this.getFormDefaults(), ...woSite };
    form.reset(
      {
        ...woSiteRawValue,
        id: { value: woSiteRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): WoSiteFormDefaults {
    return {
      id: null,
    };
  }
}
