import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IAffaireArticle, NewAffaireArticle } from '../affaire-article.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAffaireArticle for edit and NewAffaireArticleFormGroupInput for create.
 */
type AffaireArticleFormGroupInput = IAffaireArticle | PartialWithRequiredKeyOf<NewAffaireArticle>;

type AffaireArticleFormDefaults = Pick<NewAffaireArticle, 'id'>;

type AffaireArticleFormGroupContent = {
  id: FormControl<IAffaireArticle['id'] | NewAffaireArticle['id']>;
  quantiteContractuelle: FormControl<IAffaireArticle['quantiteContractuelle']>;
  quantiteRealisee: FormControl<IAffaireArticle['quantiteRealisee']>;
  affaire: FormControl<IAffaireArticle['affaire']>;
  article: FormControl<IAffaireArticle['article']>;
};

export type AffaireArticleFormGroup = FormGroup<AffaireArticleFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AffaireArticleFormService {
  createAffaireArticleFormGroup(affaireArticle: AffaireArticleFormGroupInput = { id: null }): AffaireArticleFormGroup {
    const affaireArticleRawValue = {
      ...this.getFormDefaults(),
      ...affaireArticle,
    };
    return new FormGroup<AffaireArticleFormGroupContent>({
      id: new FormControl(
        { value: affaireArticleRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      quantiteContractuelle: new FormControl(affaireArticleRawValue.quantiteContractuelle),
      quantiteRealisee: new FormControl(affaireArticleRawValue.quantiteRealisee),
      affaire: new FormControl(affaireArticleRawValue.affaire, {
        validators: [Validators.required],
      }),
      article: new FormControl(affaireArticleRawValue.article, {
        validators: [Validators.required],
      }),
    });
  }

  getAffaireArticle(form: AffaireArticleFormGroup): IAffaireArticle | NewAffaireArticle {
    return form.getRawValue() as IAffaireArticle | NewAffaireArticle;
  }

  resetForm(form: AffaireArticleFormGroup, affaireArticle: AffaireArticleFormGroupInput): void {
    const affaireArticleRawValue = { ...this.getFormDefaults(), ...affaireArticle };
    form.reset(
      {
        ...affaireArticleRawValue,
        id: { value: affaireArticleRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): AffaireArticleFormDefaults {
    return {
      id: null,
    };
  }
}
