import { IModelPhaseOT, NewModelPhaseOT } from './model-phase-ot.model';

export const sampleWithRequiredData: IModelPhaseOT = {
  id: 86005,
};

export const sampleWithPartialData: IModelPhaseOT = {
  id: 49340,
  nom: 'Kids Ball',
  description: 'SSL',
};

export const sampleWithFullData: IModelPhaseOT = {
  id: 30771,
  nom: 'a',
  description: 'SMTP visionary Limousin',
};

export const sampleWithNewData: NewModelPhaseOT = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
