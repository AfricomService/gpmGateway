import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IArticle, NewArticle } from '../article.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IArticle for edit and NewArticleFormGroupInput for create.
 */
type ArticleFormGroupInput = IArticle | PartialWithRequiredKeyOf<NewArticle>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IArticle | NewArticle> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ArticleFormRawValue = FormValueOf<IArticle>;

type NewArticleFormRawValue = FormValueOf<NewArticle>;

type ArticleFormDefaults = Pick<NewArticle, 'id' | 'createdAt' | 'updatedAt'>;

type ArticleFormGroupContent = {
  id: FormControl<ArticleFormRawValue['id'] | NewArticle['id']>;
  code: FormControl<ArticleFormRawValue['code']>;
  designation: FormControl<ArticleFormRawValue['designation']>;
  uniteMesure: FormControl<ArticleFormRawValue['uniteMesure']>;
  createdAt: FormControl<ArticleFormRawValue['createdAt']>;
  updatedAt: FormControl<ArticleFormRawValue['updatedAt']>;
  createdBy: FormControl<ArticleFormRawValue['createdBy']>;
  createdByUserLogin: FormControl<ArticleFormRawValue['createdByUserLogin']>;
  updatedBy: FormControl<ArticleFormRawValue['updatedBy']>;
  updatedByUserLogin: FormControl<ArticleFormRawValue['updatedByUserLogin']>;
};

export type ArticleFormGroup = FormGroup<ArticleFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ArticleFormService {
  createArticleFormGroup(article: ArticleFormGroupInput = { id: null }): ArticleFormGroup {
    const articleRawValue = this.convertArticleToArticleRawValue({
      ...this.getFormDefaults(),
      ...article,
    });
    return new FormGroup<ArticleFormGroupContent>({
      id: new FormControl(
        { value: articleRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      code: new FormControl(articleRawValue.code, {
        validators: [Validators.required],
      }),
      designation: new FormControl(articleRawValue.designation, {
        validators: [Validators.required],
      }),
      uniteMesure: new FormControl(articleRawValue.uniteMesure, {
        validators: [Validators.required],
      }),
      createdAt: new FormControl(articleRawValue.createdAt),
      updatedAt: new FormControl(articleRawValue.updatedAt),
      createdBy: new FormControl(articleRawValue.createdBy),
      createdByUserLogin: new FormControl(articleRawValue.createdByUserLogin),
      updatedBy: new FormControl(articleRawValue.updatedBy),
      updatedByUserLogin: new FormControl(articleRawValue.updatedByUserLogin),
    });
  }

  getArticle(form: ArticleFormGroup): IArticle | NewArticle {
    return this.convertArticleRawValueToArticle(form.getRawValue() as ArticleFormRawValue | NewArticleFormRawValue);
  }

  resetForm(form: ArticleFormGroup, article: ArticleFormGroupInput): void {
    const articleRawValue = this.convertArticleToArticleRawValue({ ...this.getFormDefaults(), ...article });
    form.reset(
      {
        ...articleRawValue,
        id: { value: articleRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ArticleFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
  }

  private convertArticleRawValueToArticle(rawArticle: ArticleFormRawValue | NewArticleFormRawValue): IArticle | NewArticle {
    return {
      ...rawArticle,
      createdAt: dayjs(rawArticle.createdAt, DATE_TIME_FORMAT),
      updatedAt: dayjs(rawArticle.updatedAt, DATE_TIME_FORMAT),
    };
  }

  private convertArticleToArticleRawValue(
    article: IArticle | (Partial<NewArticle> & ArticleFormDefaults)
  ): ArticleFormRawValue | PartialWithRequiredKeyOf<NewArticleFormRawValue> {
    return {
      ...article,
      createdAt: article.createdAt ? article.createdAt.format(DATE_TIME_FORMAT) : undefined,
      updatedAt: article.updatedAt ? article.updatedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
