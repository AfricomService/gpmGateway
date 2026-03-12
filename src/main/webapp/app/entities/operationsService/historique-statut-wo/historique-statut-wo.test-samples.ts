import dayjs from 'dayjs/esm';

import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

import { IHistoriqueStatutWO, NewHistoriqueStatutWO } from './historique-statut-wo.model';

export const sampleWithRequiredData: IHistoriqueStatutWO = {
  id: 29804,
  ancienStatut: StatutWO['VerificationWO'],
  nouveauStatut: StatutWO['ValidationTechnique'],
  dateChangement: dayjs('2026-03-11T19:09'),
};

export const sampleWithPartialData: IHistoriqueStatutWO = {
  id: 52323,
  ancienStatut: StatutWO['Creation'],
  nouveauStatut: StatutWO['Creation'],
  dateChangement: dayjs('2026-03-12T08:30'),
  commentaire: 'Saint-Bernard Investment Alsace',
  userId: 'systemic Wooden Sports',
  userLogin: 'Home portals b',
};

export const sampleWithFullData: IHistoriqueStatutWO = {
  id: 76722,
  ancienStatut: StatutWO['VerificationWO'],
  nouveauStatut: StatutWO['ValidationRessources'],
  dateChangement: dayjs('2026-03-12T04:59'),
  commentaire: 'c',
  userId: 'deposit Languedoc-Roussillon',
  userLogin: 'compress',
};

export const sampleWithNewData: NewHistoriqueStatutWO = {
  ancienStatut: StatutWO['VerificationWO'],
  nouveauStatut: StatutWO['ValidationRessources'],
  dateChangement: dayjs('2026-03-12T02:17'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
