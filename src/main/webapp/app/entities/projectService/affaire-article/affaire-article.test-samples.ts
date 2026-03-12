import { IAffaireArticle, NewAffaireArticle } from './affaire-article.model';

export const sampleWithRequiredData: IAffaireArticle = {
  id: 74102,
};

export const sampleWithPartialData: IAffaireArticle = {
  id: 18107,
};

export const sampleWithFullData: IAffaireArticle = {
  id: 22715,
  quantiteContractuelle: 31520,
  quantiteRealisee: 9565,
};

export const sampleWithNewData: NewAffaireArticle = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
