import dayjs from 'dayjs/esm';

import { IClient, NewClient } from './client.model';

export const sampleWithRequiredData: IClient = {
  id: 71655,
  raisonSociale: 'hacking',
  identifiantUnique: 'primary Poitou-Charentes Concrete',
  adresse: 'asynchronous Account a',
};

export const sampleWithPartialData: IClient = {
  id: 75607,
  raisonSociale: 'ability input Steel',
  identifiantUnique: 'reinvent PNG seamless',
  adresse: 'Car auxiliary',
  createdByUserLogin: 'Shirt Soft',
  updatedBy: 'definition Synergized a',
  updatedByUserLogin: 'driver b',
};

export const sampleWithFullData: IClient = {
  id: 97382,
  raisonSociale: 'radical Soft',
  identifiantUnique: 'salmon c',
  adresse: 'Frozen',
  telephone: '+33 592711121',
  fax: 'Home violet',
  email: 'Wandrille13@gmail.com',
  createdAt: dayjs('2026-03-11T21:57'),
  updatedAt: dayjs('2026-03-11T21:52'),
  createdBy: 'value-added Rhône-Alpes Account',
  createdByUserLogin: 'content-based Tasty',
  updatedBy: 'calculate b well-modulated',
  updatedByUserLogin: 'maximize Dobra Granite',
};

export const sampleWithNewData: NewClient = {
  raisonSociale: 'systems b',
  identifiantUnique: 'port grid-enabled Iceland',
  adresse: 'partnerships Pastourelle',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
