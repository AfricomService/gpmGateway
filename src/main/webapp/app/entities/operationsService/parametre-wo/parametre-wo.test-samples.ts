import { IParametreWO, NewParametreWO } from './parametre-wo.model';

export const sampleWithRequiredData: IParametreWO = {
  id: 12409,
};

export const sampleWithPartialData: IParametreWO = {
  id: 8122,
  description: 'withdrawal',
};

export const sampleWithFullData: IParametreWO = {
  id: 98412,
  nom: 'Gorgeous',
  description: 'Movies Superviseur',
};

export const sampleWithNewData: NewParametreWO = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
