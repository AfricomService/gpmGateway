import dayjs from 'dayjs/esm';

import { StatutFraisDeMission } from 'app/entities/enumerations/statut-frais-de-mission.model';

import { IFraisDeMission, NewFraisDeMission } from './frais-de-mission.model';

export const sampleWithRequiredData: IFraisDeMission = {
  id: 73372,
  dateDebut: dayjs('2026-03-12'),
  dateFin: dayjs('2026-03-12'),
  montantTotal: 55751,
  netAPayer: 79656,
  statut: StatutFraisDeMission['Fin'],
};

export const sampleWithPartialData: IFraisDeMission = {
  id: 28955,
  dateDebut: dayjs('2026-03-11'),
  dateFin: dayjs('2026-03-11'),
  montantTotal: 57974,
  avanceRecue: 36546,
  netAPayer: 95522,
  noteConduite: 51212,
  noteTotale: 39331,
  justificatifBonus: 'connect Baby',
  statut: StatutFraisDeMission['Verification'],
  beneficiaireUserLogin: 'empower Industrial',
  updatedAt: dayjs('2026-03-11T20:02'),
  createdByUserLogin: 'withdrawal a',
  updatedBy: 'invoice Soft',
  updatedByUserLogin: 'b',
};

export const sampleWithFullData: IFraisDeMission = {
  id: 23220,
  dateDebut: dayjs('2026-03-12'),
  dateFin: dayjs('2026-03-12'),
  montantTotal: 5231,
  avanceRecue: 14566,
  netAPayer: 16359,
  noteRendement: 38259,
  noteQualite: 61186,
  noteConduite: 14526,
  noteTotale: 86669,
  bonusExtra: 96642,
  justificatifBonus: 'Card leverage Bike',
  justificatifModification: 'multi-tasking',
  statut: StatutFraisDeMission['ValidationDirectionTechnique'],
  workOrderId: 20873,
  beneficiaireId: 'Cambridgeshire Gloves capacity',
  beneficiaireUserLogin: 'Electronics action-items',
  createdAt: dayjs('2026-03-11T21:06'),
  updatedAt: dayjs('2026-03-12T10:15'),
  createdBy: 'magnetic Gloves Mexique',
  createdByUserLogin: 'compressing parsing',
  updatedBy: 'Health',
  updatedByUserLogin: 'Handcrafted',
};

export const sampleWithNewData: NewFraisDeMission = {
  dateDebut: dayjs('2026-03-12'),
  dateFin: dayjs('2026-03-12'),
  montantTotal: 25638,
  netAPayer: 15388,
  statut: StatutFraisDeMission['Creation'],
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
