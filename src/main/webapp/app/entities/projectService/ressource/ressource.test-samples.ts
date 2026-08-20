import dayjs from 'dayjs/esm';

import { IRessource, NewRessource } from './ressource.model';

export const sampleWithRequiredData: IRessource = {
  id: 80522,
};

export const sampleWithPartialData: IRessource = {
  id: 38195,
  code: 'Frozen object-oriented',
  categorie: "d'Orsel application generate",
  description: 'a AI',
  dateMiseEnService: dayjs('2026-08-17T13:31'),
  dateProchaineMaintenance: dayjs('2026-08-18T02:31'),
  statut: 'Pompe Outdoors',
};

export const sampleWithFullData: IRessource = {
  id: 39061,
  nom: 'Bosnie-Herzégovine programming',
  code: 'Mouffetard payment',
  categorie: 'multi-state',
  description: 'capacitor',
  dateMiseEnService: dayjs('2026-08-17T14:49'),
  dateDerniereMaintenance: dayjs('2026-08-17T20:51'),
  dateProchaineMaintenance: dayjs('2026-08-17T14:58'),
  typeRessourceId: 48123,
  statut: 'orchestrate c',
};

export const sampleWithNewData: NewRessource = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
