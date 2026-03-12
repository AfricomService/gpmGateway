import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IArticleMission, NewArticleMission } from '../article-mission.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IArticleMission for edit and NewArticleMissionFormGroupInput for create.
 */
type ArticleMissionFormGroupInput = IArticleMission | PartialWithRequiredKeyOf<NewArticleMission>;

type ArticleMissionFormDefaults = Pick<NewArticleMission, 'id'>;

type ArticleMissionFormGroupContent = {
  id: FormControl<IArticleMission['id'] | NewArticleMission['id']>;
  item: FormControl<IArticleMission['item']>;
  quantitePlanifiee: FormControl<IArticleMission['quantitePlanifiee']>;
  quantiteRealisee: FormControl<IArticleMission['quantiteRealisee']>;
  articleCode: FormControl<IArticleMission['articleCode']>;
  workOrder: FormControl<IArticleMission['workOrder']>;
};

export type ArticleMissionFormGroup = FormGroup<ArticleMissionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ArticleMissionFormService {
  createArticleMissionFormGroup(articleMission: ArticleMissionFormGroupInput = { id: null }): ArticleMissionFormGroup {
    const articleMissionRawValue = {
      ...this.getFormDefaults(),
      ...articleMission,
    };
    return new FormGroup<ArticleMissionFormGroupContent>({
      id: new FormControl(
        { value: articleMissionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      item: new FormControl(articleMissionRawValue.item, {
        validators: [Validators.required],
      }),
      quantitePlanifiee: new FormControl(articleMissionRawValue.quantitePlanifiee, {
        validators: [Validators.required],
      }),
      quantiteRealisee: new FormControl(articleMissionRawValue.quantiteRealisee),
      articleCode: new FormControl(articleMissionRawValue.articleCode),
      workOrder: new FormControl(articleMissionRawValue.workOrder, {
        validators: [Validators.required],
      }),
    });
  }

  getArticleMission(form: ArticleMissionFormGroup): IArticleMission | NewArticleMission {
    return form.getRawValue() as IArticleMission | NewArticleMission;
  }

  resetForm(form: ArticleMissionFormGroup, articleMission: ArticleMissionFormGroupInput): void {
    const articleMissionRawValue = { ...this.getFormDefaults(), ...articleMission };
    form.reset(
      {
        ...articleMissionRawValue,
        id: { value: articleMissionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ArticleMissionFormDefaults {
    return {
      id: null,
    };
  }
}
