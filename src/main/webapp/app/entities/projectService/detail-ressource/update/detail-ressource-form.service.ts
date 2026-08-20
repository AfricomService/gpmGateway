import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IDetailRessource, NewDetailRessource } from '../detail-ressource.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDetailRessource for edit and NewDetailRessourceFormGroupInput for create.
 */
type DetailRessourceFormGroupInput = IDetailRessource | PartialWithRequiredKeyOf<NewDetailRessource>;

type DetailRessourceFormDefaults = Pick<NewDetailRessource, 'id' | 'status' | 'required'>;

type DetailRessourceFormGroupContent = {
  id: FormControl<IDetailRessource['id'] | NewDetailRessource['id']>;
  status: FormControl<IDetailRessource['status']>;
  label: FormControl<IDetailRessource['label']>;
  code: FormControl<IDetailRessource['code']>;
  required: FormControl<IDetailRessource['required']>;
  inputType: FormControl<IDetailRessource['inputType']>;
  multipleChoiceOption: FormControl<IDetailRessource['multipleChoiceOption']>;
};

export type DetailRessourceFormGroup = FormGroup<DetailRessourceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DetailRessourceFormService {
  createDetailRessourceFormGroup(detailRessource: DetailRessourceFormGroupInput = { id: null }): DetailRessourceFormGroup {
    const detailRessourceRawValue = {
      ...this.getFormDefaults(),
      ...detailRessource,
    };
    return new FormGroup<DetailRessourceFormGroupContent>({
      id: new FormControl(
        { value: detailRessourceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      status: new FormControl(detailRessourceRawValue.status),
      label: new FormControl(detailRessourceRawValue.label),
      code: new FormControl(detailRessourceRawValue.code),
      required: new FormControl(detailRessourceRawValue.required),
      inputType: new FormControl(detailRessourceRawValue.inputType),
      multipleChoiceOption: new FormControl(detailRessourceRawValue.multipleChoiceOption),
    });
  }

  getDetailRessource(form: DetailRessourceFormGroup): IDetailRessource | NewDetailRessource {
    return form.getRawValue() as IDetailRessource | NewDetailRessource;
  }

  resetForm(form: DetailRessourceFormGroup, detailRessource: DetailRessourceFormGroupInput): void {
    const detailRessourceRawValue = { ...this.getFormDefaults(), ...detailRessource };
    form.reset(
      {
        ...detailRessourceRawValue,
        id: { value: detailRessourceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): DetailRessourceFormDefaults {
    return {
      id: null,
      status: false,
      required: false,
    };
  }
}
