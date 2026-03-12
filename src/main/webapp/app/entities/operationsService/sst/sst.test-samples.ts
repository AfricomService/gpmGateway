import dayjs from 'dayjs/esm';

import { ISST, NewSST } from './sst.model';

export const sampleWithRequiredData: ISST = {
  id: 17008,
  label: 'digital supply-chains',
  date: dayjs('2026-03-11'),
  importance: 'Kiribati HDD Sports',
  incidentPresent: true,
  arretTravail: true,
};

export const sampleWithPartialData: ISST = {
  id: 36995,
  label: 'RAM SSL Expanded',
  date: dayjs('2026-03-12'),
  importance: 'redefine',
  commentaire: 'solutions Égypte',
  incidentPresent: true,
  arretTravail: false,
  updatedByUserLogin: 'Networked',
};

export const sampleWithFullData: ISST = {
  id: 15385,
  label: 'Pants reboot',
  date: dayjs('2026-03-12'),
  importance: 'Shoes',
  commentaire: 'Consultant input open-source',
  incidentPresent: false,
  arretTravail: true,
  createdAt: dayjs('2026-03-12T09:48'),
  updatedAt: dayjs('2026-03-12T00:59'),
  createdBy: 'deposit Multi-lateral Saint-Denis',
  createdByUserLogin: 'Borders',
  updatedBy: 'Account Concrete',
  updatedByUserLogin: 'pixel Chips Fantastic',
};

export const sampleWithNewData: NewSST = {
  label: 'Berkshire panel Ball',
  date: dayjs('2026-03-12'),
  importance: 'a',
  incidentPresent: false,
  arretTravail: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
