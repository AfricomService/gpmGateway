import { IDetailRessource, NewDetailRessource } from './detail-ressource.model';

export const sampleWithRequiredData: IDetailRessource = {
  id: 77533,
};

export const sampleWithPartialData: IDetailRessource = {
  id: 68942,
  code: 'transmit Books USB',
  required: true,
  multipleChoiceOption: 'a',
};

export const sampleWithFullData: IDetailRessource = {
  id: 82367,
  status: false,
  label: 'virtual Savings yellow',
  code: 'Cambridgeshire Lorraine',
  required: false,
  inputType: 'program',
  multipleChoiceOption: 'cohesive Plastic Fish',
};

export const sampleWithNewData: NewDetailRessource = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
