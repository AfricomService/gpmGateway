import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IFactureWO, NewFactureWO } from '../facture-wo.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFactureWO for edit and NewFactureWOFormGroupInput for create.
 */
type FactureWOFormGroupInput = IFactureWO | PartialWithRequiredKeyOf<NewFactureWO>;

type FactureWOFormDefaults = Pick<NewFactureWO, 'id'>;

type FactureWOFormGroupContent = {
  id: FormControl<IFactureWO['id'] | NewFactureWO['id']>;
  pourcentageFacture: FormControl<IFactureWO['pourcentageFacture']>;
  montantFacture: FormControl<IFactureWO['montantFacture']>;
  remarque: FormControl<IFactureWO['remarque']>;
  workOrderId: FormControl<IFactureWO['workOrderId']>;
  facture: FormControl<IFactureWO['facture']>;
};

export type FactureWOFormGroup = FormGroup<FactureWOFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FactureWOFormService {
  createFactureWOFormGroup(factureWO: FactureWOFormGroupInput = { id: null }): FactureWOFormGroup {
    const factureWORawValue = {
      ...this.getFormDefaults(),
      ...factureWO,
    };
    return new FormGroup<FactureWOFormGroupContent>({
      id: new FormControl(
        { value: factureWORawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      pourcentageFacture: new FormControl(factureWORawValue.pourcentageFacture),
      montantFacture: new FormControl(factureWORawValue.montantFacture),
      remarque: new FormControl(factureWORawValue.remarque),
      workOrderId: new FormControl(factureWORawValue.workOrderId),
      facture: new FormControl(factureWORawValue.facture, {
        validators: [Validators.required],
      }),
    });
  }

  getFactureWO(form: FactureWOFormGroup): IFactureWO | NewFactureWO {
    return form.getRawValue() as IFactureWO | NewFactureWO;
  }

  resetForm(form: FactureWOFormGroup, factureWO: FactureWOFormGroupInput): void {
    const factureWORawValue = { ...this.getFormDefaults(), ...factureWO };
    form.reset(
      {
        ...factureWORawValue,
        id: { value: factureWORawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): FactureWOFormDefaults {
    return {
      id: null,
    };
  }
}
