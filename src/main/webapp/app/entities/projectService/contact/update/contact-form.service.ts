import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IContact, NewContact } from '../contact.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IContact for edit and NewContactFormGroupInput for create.
 */
type ContactFormGroupInput = IContact | PartialWithRequiredKeyOf<NewContact>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IContact | NewContact> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ContactFormRawValue = FormValueOf<IContact>;

type NewContactFormRawValue = FormValueOf<NewContact>;

type ContactFormDefaults = Pick<NewContact, 'id' | 'createdAt' | 'updatedAt'>;

type ContactFormGroupContent = {
  id: FormControl<ContactFormRawValue['id'] | NewContact['id']>;
  raisonSociale: FormControl<ContactFormRawValue['raisonSociale']>;
  identifiantUnique: FormControl<ContactFormRawValue['identifiantUnique']>;
  adresse: FormControl<ContactFormRawValue['adresse']>;
  telephone: FormControl<ContactFormRawValue['telephone']>;
  fax: FormControl<ContactFormRawValue['fax']>;
  email: FormControl<ContactFormRawValue['email']>;
  createdAt: FormControl<ContactFormRawValue['createdAt']>;
  updatedAt: FormControl<ContactFormRawValue['updatedAt']>;
  createdBy: FormControl<ContactFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<ContactFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<ContactFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<ContactFormRawValue['updatedByUserLogin']>;
  client: FormControl<ContactFormRawValue['client']>;
};

export type ContactFormGroup = FormGroup<ContactFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ContactFormService {
  createContactFormGroup(contact: ContactFormGroupInput = { id: null }): ContactFormGroup {
    const contactRawValue = this.convertContactToContactRawValue({
      ...this.getFormDefaults(),
      ...contact,
    });
    return new FormGroup<ContactFormGroupContent>({
      id: new FormControl(
        { value: contactRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      raisonSociale: new FormControl(contactRawValue.raisonSociale, {
        validators: [Validators.required],
      }),
      identifiantUnique: new FormControl(contactRawValue.identifiantUnique),
      adresse: new FormControl(contactRawValue.adresse),
      telephone: new FormControl(contactRawValue.telephone),
      fax: new FormControl(contactRawValue.fax),
      email: new FormControl(contactRawValue.email),
      createdAt: new FormControl(contactRawValue.createdAt),
      updatedAt: new FormControl(contactRawValue.updatedAt),
      createdBy: new FormControl(contactRawValue.createdBy),
      createdByUserLogin: new FormControl(contactRawValue.createdByUserLogin),
      updatedBy: new FormControl(contactRawValue.updatedBy),
      updatedByUserLogin: new FormControl(contactRawValue.updatedByUserLogin),
      client: new FormControl(contactRawValue.client, {
        validators: [Validators.required],
      }),
    });
  }

  getContact(form: ContactFormGroup): IContact | NewContact {
    return this.convertContactRawValueToContact(form.getRawValue() as ContactFormRawValue | NewContactFormRawValue);
  }

  resetForm(form: ContactFormGroup, contact: ContactFormGroupInput): void {
    const contactRawValue = this.convertContactToContactRawValue({ ...this.getFormDefaults(), ...contact });
    form.reset(
      {
        ...contactRawValue,
        id: { value: contactRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ContactFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertContactRawValueToContact(rawContact: ContactFormRawValue | NewContactFormRawValue): IContact | NewContact {
    return {
      ...rawContact,
      createdAt: dayjs(rawContact.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawContact.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertContactToContactRawValue(
    contact: IContact | (Partial<NewContact> & ContactFormDefaults)
  ): ContactFormRawValue | PartialWithRequiredKeyOf<NewContactFormRawValue> {
    return {
      ...contact,
      createdAt: contact.createdAt ? contact.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: contact.updatedAt ? contact.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
