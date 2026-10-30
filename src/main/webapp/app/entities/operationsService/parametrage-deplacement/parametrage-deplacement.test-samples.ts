import dayjs from 'dayjs/esm';

import { IParametrageDeplacement, NewParametrageDeplacement } from './parametrage-deplacement.model';

export const sampleWithRequiredData: IParametrageDeplacement = {
  id: 74538,
};

export const sampleWithPartialData: IParametrageDeplacement = {
  id: 24058,
  workOrderId: 73461,
};

export const sampleWithFullData: IParametrageDeplacement = {
  id: 46563,
  workOrderId: 69691,
  date: dayjs('2026-10-30T03:19'),
  params: 'Reverse-engineered Account Coordinateur',
};

export const sampleWithNewData: NewParametrageDeplacement = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
