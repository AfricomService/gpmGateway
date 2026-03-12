import dayjs from 'dayjs/esm';

import { StatutDevis } from 'app/entities/enumerations/statut-devis.model';

import { IDevis, NewDevis } from './devis.model';

export const sampleWithRequiredData: IDevis = {
  id: 65977,
  reference: 'navigate data-warehouse Vaugirard',
  montant: 65505,
  date: dayjs('2026-03-12'),
  statut: StatutDevis['ExecutionDesTravaux'],
};

export const sampleWithPartialData: IDevis = {
  id: 98743,
  reference: 'Soft Bacon',
  montant: 27132,
  date: dayjs('2026-03-12'),
  statut: StatutDevis['Fin'],
  workOrderId: 96254,
  createdBy: 'Berkshire',
  updatedBy: 'circuit quantify front-end',
};

export const sampleWithFullData: IDevis = {
  id: 4984,
  reference: 'Tools virtual',
  montant: 21650,
  date: dayjs('2026-03-11'),
  statut: StatutDevis['Creation'],
  workOrderId: 27163,
  createdAt: dayjs('2026-03-12T10:26'),
  updatedAt: dayjs('2026-03-12T09:20'),
  createdBy: '1080p XSS',
  createdByUserLogin: 'Cross-platform',
  updatedBy: 'Down-sized calculate',
  updatedByUserLogin: 'JBOD',
};

export const sampleWithNewData: NewDevis = {
  reference: 'Rubber state',
  montant: 97657,
  date: dayjs('2026-03-11'),
  statut: StatutDevis['Fin'],
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
