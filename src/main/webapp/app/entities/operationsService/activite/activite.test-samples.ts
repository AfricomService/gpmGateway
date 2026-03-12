import dayjs from 'dayjs/esm';

import { IActivite, NewActivite } from './activite.model';

export const sampleWithRequiredData: IActivite = {
  id: 20271,
  code: 'Gorgeous',
  designation: 'Handcrafted',
};

export const sampleWithPartialData: IActivite = {
  id: 11070,
  code: 'a payment',
  designation: 'action-items magenta',
  updatedAt: dayjs('2026-03-11T17:31'),
};

export const sampleWithFullData: IActivite = {
  id: 7506,
  code: 'fuchsia time-frame',
  designation: 'Developpeur firewall',
  createdAt: dayjs('2026-03-11T13:44'),
  updatedAt: dayjs('2026-03-12T11:25'),
  createdBy: 'Sausages',
  createdByUserLogin: 'Nepalese black',
  updatedBy: 'bricks-and-clicks b',
  updatedByUserLogin: 'hacking a monitor',
};

export const sampleWithNewData: NewActivite = {
  code: 'Gloves',
  designation: 'Clothing',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
