import dayjs from 'dayjs/esm';

import { ISociete, NewSociete } from './societe.model';

export const sampleWithRequiredData: ISociete = {
  id: 54443,
  raisonSociale: 'driver protocol',
  identifiantUnique: 'Account Gorgeous',
  adresse: 'e-tailers',
  pays: 'b',
};

export const sampleWithPartialData: ISociete = {
  id: 47906,
  raisonSociale: 'Ouzbékistan Shirt Île-de-France',
  identifiantUnique: 'Administrateur bypassing a',
  codeArticle: 'c',
  adresse: 'back-end Analyste b',
  codePostal: 6626,
  pays: 'Leone',
  telephone: '+33 232609612',
  fax: 'Unbranded',
  updatedAt: dayjs('2026-03-12T06:44'),
  createdBy: 'user protocol enable',
  createdByUserLogin: 'navigating Granite',
  updatedBy: 'granular neural synthesize',
};

export const sampleWithFullData: ISociete = {
  id: 97698,
  raisonSociale: 'aggregate Keyboard',
  raisonSocialeAbrege: 'Royale Bûcherie Shilling',
  identifiantUnique: 'Chicken Cambridgeshire',
  registreCommerce: 'Function-based Sausages b',
  codeArticle: 'withdrawal Rustic',
  adresse: 'Cuba',
  codePostal: 75715,
  pays: 'contextually-based Fantastic',
  telephone: '+33 684297833',
  fax: 'Ball',
  email: 'Christian_Dupuy14@yahoo.fr',
  createdAt: dayjs('2026-03-12T11:50'),
  updatedAt: dayjs('2026-03-12T07:53'),
  createdBy: 'Vaugirard input a',
  createdByUserLogin: 'a',
  updatedBy: 'Outdoors strategic',
  updatedByUserLogin: 'front-end Market Dollar',
};

export const sampleWithNewData: NewSociete = {
  raisonSociale: 'Syrie pixel Credit',
  identifiantUnique: 'incubate Up-sized',
  adresse: 'Metal killer web',
  pays: 'compress Fish',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
