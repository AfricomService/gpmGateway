import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IArticleDemandeAchat, NewArticleDemandeAchat } from '../article-demande-achat.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IArticleDemandeAchat for edit and NewArticleDemandeAchatFormGroupInput for create.
 */
type ArticleDemandeAchatFormGroupInput = IArticleDemandeAchat | PartialWithRequiredKeyOf<NewArticleDemandeAchat>;

type ArticleDemandeAchatFormDefaults = Pick<NewArticleDemandeAchat, 'id'>;

type ArticleDemandeAchatFormGroupContent = {
  id: FormControl<IArticleDemandeAchat['id'] | NewArticleDemandeAchat['id']>;
  qteDemandee: FormControl<IArticleDemandeAchat['qteDemandee']>;
  type: FormControl<IArticleDemandeAchat['type']>;
  articleCode: FormControl<IArticleDemandeAchat['articleCode']>;
  demandeAchat: FormControl<IArticleDemandeAchat['demandeAchat']>;
};

export type ArticleDemandeAchatFormGroup = FormGroup<ArticleDemandeAchatFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ArticleDemandeAchatFormService {
  createArticleDemandeAchatFormGroup(articleDemandeAchat: ArticleDemandeAchatFormGroupInput = { id: null }): ArticleDemandeAchatFormGroup {
    const articleDemandeAchatRawValue = {
      ...this.getFormDefaults(),
      ...articleDemandeAchat,
    };
    return new FormGroup<ArticleDemandeAchatFormGroupContent>({
      id: new FormControl(
        { value: articleDemandeAchatRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      qteDemandee: new FormControl(articleDemandeAchatRawValue.qteDemandee, {
        validators: [Validators.required],
      }),
      type: new FormControl(articleDemandeAchatRawValue.type, {
        validators: [Validators.required],
      }),
      articleCode: new FormControl(articleDemandeAchatRawValue.articleCode),
      demandeAchat: new FormControl(articleDemandeAchatRawValue.demandeAchat, {
        validators: [Validators.required],
      }),
    });
  }

  getArticleDemandeAchat(form: ArticleDemandeAchatFormGroup): IArticleDemandeAchat | NewArticleDemandeAchat {
    return form.getRawValue() as IArticleDemandeAchat | NewArticleDemandeAchat;
  }

  resetForm(form: ArticleDemandeAchatFormGroup, articleDemandeAchat: ArticleDemandeAchatFormGroupInput): void {
    const articleDemandeAchatRawValue = { ...this.getFormDefaults(), ...articleDemandeAchat };
    form.reset(
      {
        ...articleDemandeAchatRawValue,
        id: { value: articleDemandeAchatRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): ArticleDemandeAchatFormDefaults {
    return {
      id: null,
    };
  }
}
