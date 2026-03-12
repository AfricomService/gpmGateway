import dayjs from 'dayjs/esm';

import { IMotif, NewMotif } from './motif.model';

export const sampleWithRequiredData: IMotif = {
  id: 67791,
  designation: 'Credit Incredible',
};

export const sampleWithPartialData: IMotif = {
  id: 19282,
  designation: 'Plastic invoice Cheese',
  createdAt: dayjs('2026-03-12T08:30'),
  updatedAt: dayjs('2026-03-12T03:02'),
  createdBy: 'Wooden hardware',
  updatedBy: 'mindshare',
};

export const sampleWithFullData: IMotif = {
  id: 85147,
  designation: 'Wooden orchestrate Checking',
  createdAt: dayjs('2026-03-12T01:05'),
  updatedAt: dayjs('2026-03-11T19:36'),
  createdBy: 'Cambridgeshire Clothing Technicien',
  createdByUserLogin: 'Generic Bike',
  updatedBy: 'b Champagne-Ardenne 1080p',
  updatedByUserLogin: 'Object-based',
};

export const sampleWithNewData: NewMotif = {
  designation: 'Fresh a',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
