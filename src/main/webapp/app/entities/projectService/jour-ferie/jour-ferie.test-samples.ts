import dayjs from 'dayjs/esm';

import { IJourFerie, NewJourFerie } from './jour-ferie.model';

export const sampleWithRequiredData: IJourFerie = {
  id: 93498,
  date: dayjs('2026-03-12'),
  designation: 'relationships technologies Islande',
  annee: 33250,
};

export const sampleWithPartialData: IJourFerie = {
  id: 40740,
  date: dayjs('2026-03-12'),
  designation: 'deliverables',
  annee: 77121,
};

export const sampleWithFullData: IJourFerie = {
  id: 8637,
  date: dayjs('2026-03-11'),
  designation: 'virtual secondary',
  annee: 79418,
};

export const sampleWithNewData: NewJourFerie = {
  date: dayjs('2026-03-11'),
  designation: 'République',
  annee: 74122,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
