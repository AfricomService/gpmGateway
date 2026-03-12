import dayjs from 'dayjs/esm';

import { StatutVehicule } from 'app/entities/enumerations/statut-vehicule.model';

import { IVehicule, NewVehicule } from './vehicule.model';

export const sampleWithRequiredData: IVehicule = {
  id: 89957,
  marque: 'bi-directional index Ruble',
  type: 'Account',
  matricule: 'olive Keyboard',
  nbPlaces: 44940,
  typeCarburant: 'Namibie Ergonomic Synchronised',
  statut: StatutVehicule['EnMission'],
};

export const sampleWithPartialData: IVehicule = {
  id: 27124,
  marque: 'syndicate Fish',
  type: 'Handmade Kwanza c',
  matricule: 'calculate',
  nbPlaces: 31959,
  numCarteGrise: 'Pizza hierarchy Expanded',
  dateCirculation: dayjs('2026-03-12'),
  typeCarburant: 'bypass',
  statut: StatutVehicule['EnMaintenance'],
  createdAt: dayjs('2026-03-12T05:03'),
  updatedAt: dayjs('2026-03-12T01:03'),
  createdBy: 'alarm',
  updatedBy: 'matrix',
  updatedByUserLogin: 'JBOD Suède',
};

export const sampleWithFullData: IVehicule = {
  id: 32536,
  marque: 'fresh-thinking',
  type: 'capacitor',
  matricule: 'Industrial Developpeur',
  nbPlaces: 93523,
  numCarteGrise: 'Cuba eco-centric SDR',
  dateCirculation: dayjs('2026-03-11'),
  typeCarburant: 'b rich overriding',
  chargeFixe: 47962,
  tauxConsommation: 90786,
  statut: StatutVehicule['Disponible'],
  createdAt: dayjs('2026-03-12T09:51'),
  updatedAt: dayjs('2026-03-12T07:47'),
  createdBy: "Tools d'Orsel",
  createdByUserLogin: 'systems deposit',
  updatedBy: 'Chair copy',
  updatedByUserLogin: 'c Stand-alone b',
};

export const sampleWithNewData: NewVehicule = {
  marque: 'Shoes systemic',
  type: 'Steel data-warehouse a',
  matricule: 'Kenya Manager generate',
  nbPlaces: 76176,
  typeCarburant: 'Soft COM PNG',
  statut: StatutVehicule['EnMission'],
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
