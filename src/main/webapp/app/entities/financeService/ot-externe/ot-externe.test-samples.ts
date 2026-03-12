import dayjs from 'dayjs/esm';

import { StatutOtExterne } from 'app/entities/enumerations/statut-ot-externe.model';

import { IOtExterne, NewOtExterne } from './ot-externe.model';

export const sampleWithRequiredData: IOtExterne = {
  id: 38526,
  reference: 'Sum groupware Soft',
  statut: StatutOtExterne['Fin'],
};

export const sampleWithPartialData: IOtExterne = {
  id: 36985,
  reference: 'Handcrafted Awesome SCSI',
  statut: StatutOtExterne['Paiement'],
  affaireId: 68837,
  clientId: 87385,
  updatedAt: dayjs('2026-03-12T12:49'),
  createdByUserLogin: 'Outdoors Soap Buckinghamshire',
};

export const sampleWithFullData: IOtExterne = {
  id: 16637,
  reference: 'a applications Bourgogne',
  statut: StatutOtExterne['EnCours'],
  affaireId: 98922,
  clientId: 78413,
  createdAt: dayjs('2026-03-12T03:58'),
  updatedAt: dayjs('2026-03-11T17:12'),
  createdBy: 'open-source Salvador',
  createdByUserLogin: 'Incredible parse',
  updatedBy: 'Outdoors utilize impactful',
  updatedByUserLogin: 'technologies Corse',
};

export const sampleWithNewData: NewOtExterne = {
  reference: 'Bike',
  statut: StatutOtExterne['Paiement'],
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
