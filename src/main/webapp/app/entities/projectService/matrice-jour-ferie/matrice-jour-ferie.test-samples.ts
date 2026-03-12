import { IMatriceJourFerie, NewMatriceJourFerie } from './matrice-jour-ferie.model';

export const sampleWithRequiredData: IMatriceJourFerie = {
  id: 91246,
  tarifApplique: 60480,
};

export const sampleWithPartialData: IMatriceJourFerie = {
  id: 44209,
  tarifApplique: 31121,
};

export const sampleWithFullData: IMatriceJourFerie = {
  id: 90381,
  tarifApplique: 64665,
};

export const sampleWithNewData: NewMatriceJourFerie = {
  tarifApplique: 53718,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
