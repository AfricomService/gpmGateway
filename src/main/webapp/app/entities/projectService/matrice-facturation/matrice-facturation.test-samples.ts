import { IMatriceFacturation, NewMatriceFacturation } from './matrice-facturation.model';

export const sampleWithRequiredData: IMatriceFacturation = {
  id: 25156,
  tarifBase: 42814,
  tarifMissionNuit: 55823,
  tarifHebergement: 5430,
  tarifJourFerie: 22320,
  tarifDimanche: 23736,
};

export const sampleWithPartialData: IMatriceFacturation = {
  id: 32392,
  tarifBase: 74132,
  tarifMissionNuit: 11926,
  tarifHebergement: 70607,
  tarifJourFerie: 11538,
  tarifDimanche: 40674,
};

export const sampleWithFullData: IMatriceFacturation = {
  id: 97384,
  tarifBase: 54442,
  tarifMissionNuit: 12430,
  tarifHebergement: 73243,
  tarifJourFerie: 74192,
  tarifDimanche: 42113,
};

export const sampleWithNewData: NewMatriceFacturation = {
  tarifBase: 74674,
  tarifMissionNuit: 20998,
  tarifHebergement: 21309,
  tarifJourFerie: 33706,
  tarifDimanche: 78549,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
