import { IWoMotif, NewWoMotif } from './wo-motif.model';

export const sampleWithRequiredData: IWoMotif = {
  id: 17797,
};

export const sampleWithPartialData: IWoMotif = {
  id: 38217,
};

export const sampleWithFullData: IWoMotif = {
  id: 59366,
};

export const sampleWithNewData: NewWoMotif = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
