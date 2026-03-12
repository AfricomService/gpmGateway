import dayjs from 'dayjs/esm';

import { IContact, NewContact } from './contact.model';

export const sampleWithRequiredData: IContact = {
  id: 36482,
  raisonSociale: 'online',
};

export const sampleWithPartialData: IContact = {
  id: 8641,
  raisonSociale: 'cross-platform',
  telephone: '0446732905',
  fax: 'Berkshire',
  email: 'mrance_Roy@hotmail.fr',
  createdAt: dayjs('2026-03-12T11:32'),
  updatedAt: dayjs('2026-03-11T23:22'),
  createdBy: 'c Licensed sticky',
  createdByUserLogin: 'visionary a',
  updatedByUserLogin: 'de',
};

export const sampleWithFullData: IContact = {
  id: 55775,
  raisonSociale: 'Administrateur primary',
  identifiantUnique: 'b b',
  adresse: 'AGP Health Towels',
  telephone: '+33 196463486',
  fax: 'rich',
  email: 'Jeannot.Marie49@gmail.com',
  createdAt: dayjs('2026-03-11T23:36'),
  updatedAt: dayjs('2026-03-11T14:34'),
  createdBy: 'Fish',
  createdByUserLogin: 'Berkshire',
  updatedBy: 'Wooden',
  updatedByUserLogin: 'Market mint',
};

export const sampleWithNewData: NewContact = {
  raisonSociale: 'Customizable Basse-Normandie turn-key',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
