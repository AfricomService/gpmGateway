import { ITypeRessource, NewTypeRessource } from './type-ressource.model';

export const sampleWithRequiredData: ITypeRessource = {
  id: 89984,
};

export const sampleWithPartialData: ITypeRessource = {
  id: 66888,
};

export const sampleWithFullData: ITypeRessource = {
  id: 28469,
  type: 'client-driven Berkshire Card',
  code: 'bus improvement Borders',
};

export const sampleWithNewData: NewTypeRessource = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
