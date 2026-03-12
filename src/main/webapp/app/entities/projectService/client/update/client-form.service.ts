import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IClient, NewClient } from '../client.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IClient for edit and NewClientFormGroupInput for create.
 */
type ClientFormGroupInput = IClient | PartialWithRequiredKeyOf<NewClient>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IClient | NewClient> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ClientFormRawValue = FormValueOf<IClient>;

type NewClientFormRawValue = FormValueOf<NewClient>;

type ClientFormDefaults = Pick<NewClient, 'id' | 'createdAt' | 'updatedAt'>;

type ClientFormGroupContent = {
  id: FormControl<ClientFormRawValue['id'] | NewClient['id']>;
  raisonSociale: FormControl<ClientFormRawValue['raisonSociale']>;
  identifiantUnique: FormControl<ClientFormRawValue['identifiantUnique']>;
  adresse: FormControl<ClientFormRawValue['adresse']>;
  telephone: FormControl<ClientFormRawValue['telephone']>;
  fax: FormControl<ClientFormRawValue['fax']>;
  email: FormControl<ClientFormRawValue['email']>;
  createdAt: FormControl<ClientFormRawValue['createdAt']>;
  updatedAt: FormControl<ClientFormRawValue['updatedAt']>;
  createdBy: FormControl<ClientFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<ClientFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<ClientFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<ClientFormRawValue['updatedByUserLogin']>;
};

export type ClientFormGroup = FormGroup<ClientFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ClientFormService {
  createClientFormGroup(client: ClientFormGroupInput = { id: null }): ClientFormGroup {
    const clientRawValue = this.convertClientToClientRawValue({
      ...this.getFormDefaults(),
      ...client,
    });
    return new FormGroup<ClientFormGroupContent>({
      id: new FormControl(
        { value: clientRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      raisonSociale: new FormControl(clientRawValue.raisonSociale, {
        validators: [Validators.required],
      }),
      identifiantUnique: new FormControl(clientRawValue.identifiantUnique, {
        validators: [Validators.required],
      }),
      adresse: new FormControl(clientRawValue.adresse, {
        validators: [Validators.required],
      }),
      telephone: new FormControl(clientRawValue.telephone),
      fax: new FormControl(clientRawValue.fax),
      email: new FormControl(clientRawValue.email),
      createdAt: new FormControl(clientRawValue.createdAt),
      updatedAt: new FormControl(clientRawValue.updatedAt),
      createdBy: new FormControl(clientRawValue.createdBy),
      createdByUserLogin: new FormControl(clientRawValue.createdByUserLogin),
      updatedBy: new FormControl(clientRawValue.updatedBy),
      updatedByUserLogin: new FormControl(clientRawValue.updatedByUserLogin),
    });
  }

  getClient(form: ClientFormGroup): IClient | NewClient {
    return this.convertClientRawValueToClient(form.getRawValue() as ClientFormRawValue | NewClientFormRawValue);
  }

  resetForm(form: ClientFormGroup, client: ClientFormGroupInput): void {
    const clientRawValue = this.convertClientToClientRawValue({ ...this.getFormDefaults(), ...client });
    form.reset(
      {
        ...clientRawValue,
        id: { value: clientRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ClientFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertClientRawValueToClient(rawClient: ClientFormRawValue | NewClientFormRawValue): IClient | NewClient {
    return {
      ...rawClient,
      createdAt: dayjs(rawClient.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawClient.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertClientToClientRawValue(
    client: IClient | (Partial<NewClient> & ClientFormDefaults)
  ): ClientFormRawValue | PartialWithRequiredKeyOf<NewClientFormRawValue> {
    return {
      ...client,
      createdAt: client.createdAt ? client.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: client.updatedAt ? client.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
