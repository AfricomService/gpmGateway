import dayjs from 'dayjs/esm';

import { IAgence, NewAgence } from './agence.model';

export const sampleWithRequiredData: IAgence = {
  id: 3474,
  designation: 'Concrete Stagiaire Francs-Bourgeois',
  adresse: 'c haptic',
  ville: 'human-resource redundant Technicien',
  pays: 'vortals Wooden',
};

export const sampleWithPartialData: IAgence = {
  id: 82562,
  designation: 'invoice',
  adresse: 'unleash mission-critical HTTP',
  ville: 'invoice Producteur transmit',
  pays: 'orange c Books',
  updatedByUserLogin: 'Loan relationships b',
};

export const sampleWithFullData: IAgence = {
  id: 91592,
  designation: 'Stand-alone b array',
  adresse: 'technologies b encryption',
  ville: 'bandwidth',
  pays: 'transmitter vortals',
  createdAt: dayjs('2026-03-11T18:52'),
  updatedAt: dayjs('2026-03-12T04:52'),
  createdBy: 'a',
  createdByUserLogin: 'Faubourg withdrawal Lek',
  updatedBy: 'Auto Sausages green',
  updatedByUserLogin: 'e-enable Birmanie portals',
};

export const sampleWithNewData: NewAgence = {
  designation: 'b',
  adresse: 'integrated',
  ville: 'Steel',
  pays: 'Manager deposit Nepalese',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
