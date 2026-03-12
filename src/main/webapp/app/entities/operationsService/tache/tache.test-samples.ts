import { ITache, NewTache } from './tache.model';

export const sampleWithRequiredData: ITache = {
  id: 86917,
  roleDansLaMission: 'infomediaries a',
};

export const sampleWithPartialData: ITache = {
  id: 78694,
  roleDansLaMission: 'bandwidth program',
  remboursement: 51181,
};

export const sampleWithFullData: ITache = {
  id: 42366,
  roleDansLaMission: 'optical',
  note: 471,
  remboursement: 38170,
  executeurId: 'Saussaies SQL bluetooth',
  executeurUserLogin: 'violet Incredible de',
};

export const sampleWithNewData: NewTache = {
  roleDansLaMission: 'Rial',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
