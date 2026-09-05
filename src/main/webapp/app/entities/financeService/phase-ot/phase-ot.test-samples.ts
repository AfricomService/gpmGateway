import dayjs from 'dayjs/esm';

import { IPhaseOt, NewPhaseOt } from './phase-ot.model';

export const sampleWithRequiredData: IPhaseOt = {
  id: 6914,
};

export const sampleWithPartialData: IPhaseOt = {
  id: 82282,
  nom: 'a Account Krone',
  description: 'c Producteur Electronics',
  duree: 14596,
  bloquante: true,
  dl: dayjs('2026-08-25T09:21'),
  dlc: dayjs('2026-08-25T15:45'),
  phaseParentId: 33444,
};

export const sampleWithFullData: IPhaseOt = {
  id: 22274,
  nom: 'zero solution matrix',
  description: 'Fish',
  duree: 10009,
  bloquante: true,
  statut: 'Nouvelle-Zélande',
  dateDebut: dayjs('2026-08-26T04:27'),
  dl: dayjs('2026-08-26T04:02'),
  dlc: dayjs('2026-08-25T08:36'),
  phaseParentId: 85177,
};

export const sampleWithNewData: NewPhaseOt = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
