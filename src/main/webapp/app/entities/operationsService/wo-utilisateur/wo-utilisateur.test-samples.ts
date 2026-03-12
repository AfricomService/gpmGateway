import { IWoUtilisateur, NewWoUtilisateur } from './wo-utilisateur.model';

export const sampleWithRequiredData: IWoUtilisateur = {
  id: 65045,
  role: 'Checking microchip functionalities',
};

export const sampleWithPartialData: IWoUtilisateur = {
  id: 71448,
  role: 'Dominique a',
  userLogin: 'Borders e-tailers',
};

export const sampleWithFullData: IWoUtilisateur = {
  id: 11528,
  role: 'Practical',
  userId: 'Norwegian Rhône-Alpes',
  userLogin: 'redundant Havre open-source',
};

export const sampleWithNewData: NewWoUtilisateur = {
  role: 'Berkshire',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
