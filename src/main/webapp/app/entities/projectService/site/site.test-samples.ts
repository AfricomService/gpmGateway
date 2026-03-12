import dayjs from 'dayjs/esm';

import { ISite, NewSite } from './site.model';

export const sampleWithRequiredData: ISite = {
  id: 70275,
  code: 'Molière',
  designation: 'services',
};

export const sampleWithPartialData: ISite = {
  id: 77311,
  code: 'turn-key Optional indexing',
  designation: 'Home Rubber Beauty',
  gpsY: 96634,
  createdAt: dayjs('2026-03-12T09:55'),
};

export const sampleWithFullData: ISite = {
  id: 26781,
  code: 'a Zadkine',
  designation: 'synthesize scale',
  gpsX: 93355,
  gpsY: 777,
  createdAt: dayjs('2026-03-11T15:10'),
  updatedAt: dayjs('2026-03-12T12:22'),
  createdBy: 'Corse Organized Metical',
  createdByUserLogin: 'Sudanese',
  updatedBy: 'digital Sausages',
  updatedByUserLogin: 'Cheese non-volatile Frozen',
};

export const sampleWithNewData: NewSite = {
  code: 'Granite array Agent',
  designation: 'AI online',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
