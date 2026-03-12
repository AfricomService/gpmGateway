import { TypeArticleDemandeAchat } from 'app/entities/enumerations/type-article-demande-achat.model';

import { IArticleDemandeAchat, NewArticleDemandeAchat } from './article-demande-achat.model';

export const sampleWithRequiredData: IArticleDemandeAchat = {
  id: 87857,
  qteDemandee: 65396,
  type: TypeArticleDemandeAchat['Fourniture'],
};

export const sampleWithPartialData: IArticleDemandeAchat = {
  id: 50773,
  qteDemandee: 84726,
  type: TypeArticleDemandeAchat['Service'],
};

export const sampleWithFullData: IArticleDemandeAchat = {
  id: 94846,
  qteDemandee: 21535,
  type: TypeArticleDemandeAchat['Service'],
  articleCode: 'Languedoc-Roussillon',
};

export const sampleWithNewData: NewArticleDemandeAchat = {
  qteDemandee: 81564,
  type: TypeArticleDemandeAchat['Fourniture'],
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
