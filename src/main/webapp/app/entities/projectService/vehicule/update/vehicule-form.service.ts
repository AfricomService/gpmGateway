import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IVehicule, NewVehicule } from '../vehicule.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IVehicule for edit and NewVehiculeFormGroupInput for create.
 */
type VehiculeFormGroupInput = IVehicule | PartialWithRequiredKeyOf<NewVehicule>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IVehicule | NewVehicule> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type VehiculeFormRawValue = FormValueOf<IVehicule>;

type NewVehiculeFormRawValue = FormValueOf<NewVehicule>;

type VehiculeFormDefaults = Pick<NewVehicule, 'id' | 'createdAt' | 'updatedAt'>;

type VehiculeFormGroupContent = {
  id: FormControl<VehiculeFormRawValue['id'] | NewVehicule['id']>;
  marque: FormControl<VehiculeFormRawValue['marque']>;
  type: FormControl<VehiculeFormRawValue['type']>;
  matricule: FormControl<VehiculeFormRawValue['matricule']>;
  nbPlaces: FormControl<VehiculeFormRawValue['nbPlaces']>;
  numCarteGrise: FormControl<VehiculeFormRawValue['numCarteGrise']>;
  dateCirculation: FormControl<VehiculeFormRawValue['dateCirculation']>;
  typeCarburant: FormControl<VehiculeFormRawValue['typeCarburant']>;
  chargeFixe: FormControl<VehiculeFormRawValue['chargeFixe']>;
  tauxConsommation: FormControl<VehiculeFormRawValue['tauxConsommation']>;
  statut: FormControl<VehiculeFormRawValue['statut']>;
  createdAt: FormControl<VehiculeFormRawValue['createdAt']>;
  updatedAt: FormControl<VehiculeFormRawValue['updatedAt']>;
  createdBy: FormControl<VehiculeFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<VehiculeFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<VehiculeFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<VehiculeFormRawValue['updatedByUserLogin']>;
  agence: FormControl<VehiculeFormRawValue['agence']>;
};

export type VehiculeFormGroup = FormGroup<VehiculeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class VehiculeFormService {
  createVehiculeFormGroup(vehicule: VehiculeFormGroupInput = { id: null }): VehiculeFormGroup {
    const vehiculeRawValue = this.convertVehiculeToVehiculeRawValue({
      ...this.getFormDefaults(),
      ...vehicule,
    });
    return new FormGroup<VehiculeFormGroupContent>({
      id: new FormControl(
        { value: vehiculeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      marque: new FormControl(vehiculeRawValue.marque, {
        validators: [Validators.required],
      }),
      type: new FormControl(vehiculeRawValue.type, {
        validators: [Validators.required],
      }),
      matricule: new FormControl(vehiculeRawValue.matricule, {
        validators: [Validators.required],
      }),
      nbPlaces: new FormControl(vehiculeRawValue.nbPlaces, {
        validators: [Validators.required],
      }),
      numCarteGrise: new FormControl(vehiculeRawValue.numCarteGrise),
      dateCirculation: new FormControl(vehiculeRawValue.dateCirculation),
      typeCarburant: new FormControl(vehiculeRawValue.typeCarburant, {
        validators: [Validators.required],
      }),
      chargeFixe: new FormControl(vehiculeRawValue.chargeFixe),
      tauxConsommation: new FormControl(vehiculeRawValue.tauxConsommation),
      statut: new FormControl(vehiculeRawValue.statut, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(vehiculeRawValue.createdAt),
      updatedAt: new FormControl(vehiculeRawValue.updatedAt),
      createdBy: new FormControl(vehiculeRawValue.createdBy),
      createdByUserLogin: new FormControl(vehiculeRawValue.createdByUserLogin),
      updatedBy: new FormControl(vehiculeRawValue.updatedBy),
      updatedByUserLogin: new FormControl(vehiculeRawValue.updatedByUserLogin),
      agence: new FormControl(vehiculeRawValue.agence, {
        validators: [Validators.required],
      }),
    });
  }

  getVehicule(form: VehiculeFormGroup): IVehicule | NewVehicule {
    return this.convertVehiculeRawValueToVehicule(form.getRawValue() as VehiculeFormRawValue | NewVehiculeFormRawValue);
  }

  resetForm(form: VehiculeFormGroup, vehicule: VehiculeFormGroupInput): void {
    const vehiculeRawValue = this.convertVehiculeToVehiculeRawValue({ ...this.getFormDefaults(), ...vehicule });
    form.reset(
      {
        ...vehiculeRawValue,
        id: { value: vehiculeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): VehiculeFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertVehiculeRawValueToVehicule(rawVehicule: VehiculeFormRawValue | NewVehiculeFormRawValue): IVehicule | NewVehicule {
    return {
      ...rawVehicule,
      createdAt: dayjs(rawVehicule.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawVehicule.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertVehiculeToVehiculeRawValue(
    vehicule: IVehicule | (Partial<NewVehicule> & VehiculeFormDefaults)
  ): VehiculeFormRawValue | PartialWithRequiredKeyOf<NewVehiculeFormRawValue> {
    return {
      ...vehicule,
      createdAt: vehicule.createdAt ? vehicule.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: vehicule.updatedAt ? vehicule.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
