import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ISite, NewSite } from '../site.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISite for edit and NewSiteFormGroupInput for create.
 */
type SiteFormGroupInput = ISite | PartialWithRequiredKeyOf<NewSite>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ISite | NewSite> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type SiteFormRawValue = FormValueOf<ISite>;

type NewSiteFormRawValue = FormValueOf<NewSite>;

type SiteFormDefaults = Pick<NewSite, 'id' | 'createdAt' | 'updatedAt'>;

type SiteFormGroupContent = {
  id: FormControl<SiteFormRawValue['id'] | NewSite['id']>;
  code: FormControl<SiteFormRawValue['code']>;
  designation: FormControl<SiteFormRawValue['designation']>;
  gpsX: FormControl<SiteFormRawValue['gpsX']>;
  gpsY: FormControl<SiteFormRawValue['gpsY']>;
  createdAt: FormControl<SiteFormRawValue['createdAt']>;
  updatedAt: FormControl<SiteFormRawValue['updatedAt']>;
  createdBy: FormControl<SiteFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<SiteFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<SiteFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<SiteFormRawValue['updatedByUserLogin']>;
  ville: FormControl<SiteFormRawValue['ville']>;
  client: FormControl<SiteFormRawValue['client']>;
};

export type SiteFormGroup = FormGroup<SiteFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SiteFormService {
  createSiteFormGroup(site: SiteFormGroupInput = { id: null }): SiteFormGroup {
    const siteRawValue = this.convertSiteToSiteRawValue({
      ...this.getFormDefaults(),
      ...site,
    });
    return new FormGroup<SiteFormGroupContent>({
      id: new FormControl(
        { value: siteRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      code: new FormControl(siteRawValue.code, {
        validators: [Validators.required],
      }),
      designation: new FormControl(siteRawValue.designation, {
        validators: [Validators.required],
      }),
      gpsX: new FormControl(siteRawValue.gpsX),
      gpsY: new FormControl(siteRawValue.gpsY),
      createdAt: new FormControl(siteRawValue.createdAt),
      updatedAt: new FormControl(siteRawValue.updatedAt),
      createdBy: new FormControl(siteRawValue.createdBy),
      createdByUserLogin: new FormControl(siteRawValue.createdByUserLogin),
      updatedBy: new FormControl(siteRawValue.updatedBy),
      updatedByUserLogin: new FormControl(siteRawValue.updatedByUserLogin),
      ville: new FormControl(siteRawValue.ville, {
        validators: [Validators.required],
      }),
      client: new FormControl(siteRawValue.client, {
        validators: [Validators.required],
      }),
    });
  }

  getSite(form: SiteFormGroup): ISite | NewSite {
    return this.convertSiteRawValueToSite(form.getRawValue() as SiteFormRawValue | NewSiteFormRawValue);
  }

  resetForm(form: SiteFormGroup, site: SiteFormGroupInput): void {
    const siteRawValue = this.convertSiteToSiteRawValue({ ...this.getFormDefaults(), ...site });
    form.reset(
      {
        ...siteRawValue,
        id: { value: siteRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): SiteFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertSiteRawValueToSite(rawSite: SiteFormRawValue | NewSiteFormRawValue): ISite | NewSite {
    return {
      ...rawSite,
      createdAt: dayjs(rawSite.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawSite.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertSiteToSiteRawValue(
    site: ISite | (Partial<NewSite> & SiteFormDefaults)
  ): SiteFormRawValue | PartialWithRequiredKeyOf<NewSiteFormRawValue> {
    return {
      ...site,
      createdAt: site.createdAt ? site.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: site.updatedAt ? site.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
