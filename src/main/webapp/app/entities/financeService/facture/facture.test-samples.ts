import dayjs from 'dayjs/esm';

import { StatutFacture } from 'app/entities/enumerations/statut-facture.model';

import { IFacture, NewFacture } from './facture.model';

export const sampleWithRequiredData: IFacture = {
  id: 59520,
  numFacture: 'Granite',
  montantFacture: 70074,
  dateFacture: dayjs('2026-03-12'),
  statut: StatutFacture['Decharge'],
};

export const sampleWithPartialData: IFacture = {
  id: 78250,
  numFacture: 'target',
  montantFacture: 18894,
  dateFacture: dayjs('2026-03-12'),
  statut: StatutFacture['Creation'],
  clientId: 92223,
  createdBy: 'withdrawal',
  createdByUserLogin: 'incubate',
  updatedByUserLogin: 'c',
};

export const sampleWithFullData: IFacture = {
  id: 25891,
  numFacture: 'Grocery Basse-Normandie',
  bonDeCommande: 'Tuna Pérou',
  montantFacture: 53199,
  dateFacture: dayjs('2026-03-11'),
  dateEcheance: dayjs('2026-03-11'),
  dateDecharge: dayjs('2026-03-11'),
  statut: StatutFacture['Paiement'],
  clientId: 52426,
  createdAt: dayjs('2026-03-11T17:24'),
  updatedAt: dayjs('2026-03-12T06:36'),
  createdBy: 'Cambridgeshire',
  createdByUserLogin: 'dynamic payment azure',
  updatedBy: "Soft l'Abbaye",
  updatedByUserLogin: 'Analyste reboot Fresh',
};

export const sampleWithNewData: NewFacture = {
  numFacture: 'Israël Buckinghamshire Account',
  montantFacture: 97273,
  dateFacture: dayjs('2026-03-11'),
  statut: StatutFacture['Fin'],
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
