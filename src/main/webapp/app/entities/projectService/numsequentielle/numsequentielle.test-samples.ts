import { INumsequentielle, NewNumsequentielle } from './numsequentielle.model';

export const sampleWithRequiredData: INumsequentielle = {
  id: 11684,
  nextNumber: 'Account de',
};

export const sampleWithPartialData: INumsequentielle = {
  id: 48056,
  prefix: 'up Ergonomic Wooden',
  nextNumber: 'Investment',
};

export const sampleWithFullData: INumsequentielle = {
  id: 37882,
  prefix: 'niches b',
  nextNumber: 'Savings markets Dollar',
  format: 'Administrateur',
  codeNumSeq: 'Superviseur withdrawal bottom-line',
};

export const sampleWithNewData: NewNumsequentielle = {
  nextNumber: 'Stagiaire',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
