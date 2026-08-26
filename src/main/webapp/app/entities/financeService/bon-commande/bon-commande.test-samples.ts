import dayjs from 'dayjs/esm';

import { IBonCommande, NewBonCommande } from './bon-commande.model';

export const sampleWithRequiredData: IBonCommande = {
  id: 44939,
};

export const sampleWithPartialData: IBonCommande = {
  id: 16541,
  affaireId: 36103,
  lieu: 'generating HTTP Cotton',
  montantCommande: 20594,
};

export const sampleWithFullData: IBonCommande = {
  id: 44746,
  clientId: 14799,
  affaireId: 99756,
  lieu: 'didactic gold',
  responsableId: 'feed',
  referenceClient: 'Berkshire frame',
  dateBonCommande: dayjs('2026-07-13T07:02'),
  montantTotal: 58249,
  montantCommande: 44120,
  montantConsomme: 26259,
  montantMissionEffectue: 18452,
};

export const sampleWithNewData: NewBonCommande = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
