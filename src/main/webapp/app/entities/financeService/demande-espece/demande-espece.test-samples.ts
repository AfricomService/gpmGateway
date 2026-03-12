import dayjs from 'dayjs/esm';

import { IDemandeEspece, NewDemandeEspece } from './demande-espece.model';

export const sampleWithRequiredData: IDemandeEspece = {
  id: 76577,
  montant: 87559,
  motif: 'Sleek a',
};

export const sampleWithPartialData: IDemandeEspece = {
  id: 33614,
  montant: 34736,
  motif: 'XML Pizza Cotton',
  beneficiaireId: 'Steel Rustic',
  beneficiaireUserLogin: 'Avon c',
  createdAt: dayjs('2026-03-11T19:27'),
  createdByUserLogin: 'Practical bluetooth auxiliary',
};

export const sampleWithFullData: IDemandeEspece = {
  id: 13555,
  montant: 91901,
  motif: 'du logistical Checking',
  workOrderId: 95740,
  beneficiaireId: 'de Intelligent',
  beneficiaireUserLogin: 'Concrete applications',
  createdAt: dayjs('2026-03-11T16:17'),
  updatedAt: dayjs('2026-03-11T21:49'),
  createdBy: 'Loan',
  createdByUserLogin: 'Corse extensible',
  updatedBy: 'overriding Argentine drive',
  updatedByUserLogin: 'azure',
};

export const sampleWithNewData: NewDemandeEspece = {
  montant: 28201,
  motif: 'input invoice c',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
