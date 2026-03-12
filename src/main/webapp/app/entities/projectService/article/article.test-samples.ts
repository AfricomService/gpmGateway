import dayjs from 'dayjs/esm';

import { IArticle, NewArticle } from './article.model';

export const sampleWithRequiredData: IArticle = {
  id: 61675,
  code: 'payment Upgradable',
  designation: 'definition',
  uniteMesure: 'customer analyzing',
};

export const sampleWithPartialData: IArticle = {
  id: 72890,
  code: 'infomediaries c gold',
  designation: 'Hat application quantifying',
  uniteMesure: 'grey',
  createdAt: dayjs('2026-03-11T13:32'),
  updatedAt: dayjs('2026-03-11T20:16'),
  createdByUserLogin: 'local quantify vortals',
  updatedByUserLogin: 'Sleek transform',
};

export const sampleWithFullData: IArticle = {
  id: 45699,
  code: 'Tools',
  designation: 'composite Visionary',
  uniteMesure: 'Ingenieur',
  createdAt: dayjs('2026-03-11T20:16'),
  updatedAt: dayjs('2026-03-12T04:29'),
  createdBy: 'Ethiopian',
  createdByUserLogin: 'Superviseur solid Soft',
  updatedBy: 'Guinée compress',
  updatedByUserLogin: 'Rand Picardie Wooden',
};

export const sampleWithNewData: NewArticle = {
  code: 'index',
  designation: 'deposit Multi-layered e-markets',
  uniteMesure: 'calculate Saint-Bernard',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
