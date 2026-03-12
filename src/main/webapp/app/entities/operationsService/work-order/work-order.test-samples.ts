import dayjs from 'dayjs/esm';

import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

import { IWorkOrder, NewWorkOrder } from './work-order.model';

export const sampleWithRequiredData: IWorkOrder = {
  id: 78666,
  dateHeureDebutPrev: dayjs('2026-03-11T20:52'),
  dateHeureFinPrev: dayjs('2026-03-12T08:11'),
  missionDeNuit: false,
  hebergement: false,
  statut: StatutWO['ValidationRessources'],
};

export const sampleWithPartialData: IWorkOrder = {
  id: 2048,
  clientId: 35106,
  vehiculeId: 55656,
  valideurUserLogin: 'dynamic Gorgeous Avon',
  dateHeureDebutPrev: dayjs('2026-03-12T09:22'),
  dateHeureFinPrev: dayjs('2026-03-12T09:26'),
  missionDeNuit: false,
  nombreNuits: 56336,
  hebergement: true,
  numFicheIntervention: 'Berkshire',
  statut: StatutWO['Creation'],
  materielUtilise: 'ability a Manager',
  createdAt: dayjs('2026-03-12T11:36'),
  createdBy: 'a payment',
  createdByUserLogin: 'deposit payment',
  updatedBy: 'Marcadet Rubber',
};

export const sampleWithFullData: IWorkOrder = {
  id: 81004,
  clientId: 95551,
  affaireId: 95988,
  demandeurContactId: 78459,
  vehiculeId: 67329,
  otExterneId: 81446,
  valideurId: 'navigating Shirt',
  valideurUserLogin: 'hack Steel Gorgeous',
  dateHeureDebutPrev: dayjs('2026-03-11T17:10'),
  dateHeureFinPrev: dayjs('2026-03-12T05:08'),
  dateHeureDebutReel: dayjs('2026-03-11T13:54'),
  dateHeureFinReel: dayjs('2026-03-12T13:25'),
  missionDeNuit: true,
  nombreNuits: 76906,
  hebergement: true,
  nombreHebergements: 76978,
  remarque: 'open-source national',
  numFicheIntervention: 'background Pays Won',
  statut: StatutWO['ValidationTechnique'],
  materielUtilise: 'Coordinateur Industrial Intelligent',
  createdAt: dayjs('2026-03-12T01:31'),
  updatedAt: dayjs('2026-03-12T01:11'),
  createdBy: 'Account Seine productize',
  createdByUserLogin: 'Bulgarie Frozen orchid',
  updatedBy: 'rich Beauty Kiribati',
  updatedByUserLogin: 'robust invoice',
};

export const sampleWithNewData: NewWorkOrder = {
  dateHeureDebutPrev: dayjs('2026-03-11T14:32'),
  dateHeureFinPrev: dayjs('2026-03-12T06:58'),
  missionDeNuit: false,
  hebergement: true,
  statut: StatutWO['ValidationRessources'],
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
