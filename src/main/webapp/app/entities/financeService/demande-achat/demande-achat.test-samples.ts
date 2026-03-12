import dayjs from 'dayjs/esm';

import { StatutDemandeAchat } from 'app/entities/enumerations/statut-demande-achat.model';
import { TypeDemandeAchat } from 'app/entities/enumerations/type-demande-achat.model';

import { IDemandeAchat, NewDemandeAchat } from './demande-achat.model';

export const sampleWithRequiredData: IDemandeAchat = {
  id: 22402,
  code: 'Switchable c whiteboard',
  statut: StatutDemandeAchat['Valide'],
  type: TypeDemandeAchat['OffreDePrix'],
  dateCreation: dayjs('2026-03-11T22:14'),
  dateMiseADisposition: dayjs('2026-03-12'),
};

export const sampleWithPartialData: IDemandeAchat = {
  id: 1731,
  code: 'AI IB Account',
  statut: StatutDemandeAchat['Soumis'],
  type: TypeDemandeAchat['Achat'],
  dateCreation: dayjs('2026-03-11T14:32'),
  dateMiseADisposition: dayjs('2026-03-11'),
  workOrderId: 25969,
  validateurId: 'c Loan microchip',
  validateurUserLogin: 'Basse-Normandie input',
  createdBy: 'a Industrial orange',
  createdByUserLogin: 'Shoes Sports',
  updatedBy: 'FTP',
  updatedByUserLogin: 'scalable methodologies',
};

export const sampleWithFullData: IDemandeAchat = {
  id: 57060,
  code: 'end-to-end Îles benchmark',
  statut: StatutDemandeAchat['Valide'],
  type: TypeDemandeAchat['OffreDePrix'],
  dateCreation: dayjs('2026-03-11T14:59'),
  dateMiseADisposition: dayjs('2026-03-12'),
  workOrderId: 38627,
  affaireId: 79318,
  demandeurId: 'Hat Towels',
  demandeurUserLogin: 'silver',
  validateurId: 'wireless deposit Albanie',
  validateurUserLogin: 'maroon transmitting',
  createdAt: dayjs('2026-03-12T00:06'),
  updatedAt: dayjs('2026-03-11T19:35'),
  createdBy: 'alarm Berkshire c',
  createdByUserLogin: 'Savings flexibility',
  updatedBy: 'Kids',
  updatedByUserLogin: 'PNG Handmade',
};

export const sampleWithNewData: NewDemandeAchat = {
  code: 'online b',
  statut: StatutDemandeAchat['Valide'],
  type: TypeDemandeAchat['Achat'],
  dateCreation: dayjs('2026-03-12T00:52'),
  dateMiseADisposition: dayjs('2026-03-11'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
