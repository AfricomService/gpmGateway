import { IZone, NewZone } from './zone.model';

export const sampleWithRequiredData: IZone = {
  id: 81853,
  nom: 'Account Dollar',
};

export const sampleWithPartialData: IZone = {
  id: 97611,
  nom: 'solution',
};

export const sampleWithFullData: IZone = {
  id: 75959,
  nom: 'Music incubate',
};

export const sampleWithNewData: NewZone = {
  nom: 'Lepic',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
