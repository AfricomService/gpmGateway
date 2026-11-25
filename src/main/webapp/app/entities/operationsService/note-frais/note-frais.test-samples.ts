import dayjs from 'dayjs/esm';

import { INoteFrais, NewNoteFrais } from './note-frais.model';

export const sampleWithRequiredData: INoteFrais = {
  id: 94676,
};

export const sampleWithPartialData: INoteFrais = {
  id: 13404,
  dateDebut: dayjs('2026-11-19T10:53'),
  montantTotale: 31070,
  montantTotaleEnLettre: 'gold',
};

export const sampleWithFullData: INoteFrais = {
  id: 96578,
  dateDebut: dayjs('2026-11-19T08:52'),
  dateFin: dayjs('2026-11-19T13:44'),
  contactSocieteId: 76679,
  montantTotale: 64227,
  montantTotaleEnLettre: 'sensor European',
};

export const sampleWithNewData: NewNoteFrais = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
