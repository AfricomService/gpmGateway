import dayjs from 'dayjs/esm';

import { IPieceJointe, NewPieceJointe } from './piece-jointe.model';

export const sampleWithRequiredData: IPieceJointe = {
  id: 43572,
  nomFichier: 'Jewelery',
  type: 'Oman',
  fichierURL: 'SCSI AGP c',
  dateUpload: dayjs('2026-03-12T02:33'),
};

export const sampleWithPartialData: IPieceJointe = {
  id: 24569,
  nomFichier: 'invoice',
  type: 'virtual capacitor',
  fichierURL: 'input generate Rustic',
  dateUpload: dayjs('2026-03-11T15:09'),
};

export const sampleWithFullData: IPieceJointe = {
  id: 7710,
  nomFichier: 'engage Outdoors',
  type: 'Grocery b',
  fichierURL: 'programming',
  dateUpload: dayjs('2026-03-12T09:42'),
  workOrderId: 46424,
};

export const sampleWithNewData: NewPieceJointe = {
  nomFichier: 'b time-frame',
  type: 'JSON relationships Intelligent',
  fichierURL: 'zero Havre',
  dateUpload: dayjs('2026-03-12T02:27'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
