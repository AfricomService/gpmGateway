import { IVille, NewVille } from './ville.model';

export const sampleWithRequiredData: IVille = {
  id: 83175,
  nom: 'Rubber',
};

export const sampleWithPartialData: IVille = {
  id: 9613,
  nom: 'a circuit',
};

export const sampleWithFullData: IVille = {
  id: 32481,
  nom: 'Secured',
};

export const sampleWithNewData: NewVille = {
  nom: 'Jordan Algerian Home',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
