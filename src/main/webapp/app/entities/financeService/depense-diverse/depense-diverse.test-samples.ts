import dayjs from 'dayjs/esm';

import { IDepenseDiverse, NewDepenseDiverse } from './depense-diverse.model';

export const sampleWithRequiredData: IDepenseDiverse = {
  id: 64391,
  motif: 'leverage feed',
  montant: 75731,
};

export const sampleWithPartialData: IDepenseDiverse = {
  id: 65065,
  motif: 'Agent invoice hard',
  montant: 66920,
  date: dayjs('2026-03-12'),
  createdAt: dayjs('2026-03-12T01:58'),
  updatedByUserLogin: 'Books Profound c',
};

export const sampleWithFullData: IDepenseDiverse = {
  id: 819,
  motif: 'Cotton evolve',
  montant: 42285,
  date: dayjs('2026-03-11'),
  justificatif: 'Midi-Pyrénées online benchmark',
  workOrderId: 32912,
  createdAt: dayjs('2026-03-12T07:22'),
  updatedAt: dayjs('2026-03-11T20:10'),
  createdBy: 'Multi-tiered withdrawal Gambie',
  createdByUserLogin: 'vortals c invoice',
  updatedBy: 'scale withdrawal green',
  updatedByUserLogin: 'Berkshire Concrete Borders',
};

export const sampleWithNewData: NewDepenseDiverse = {
  motif: 'SMS',
  montant: 5237,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
