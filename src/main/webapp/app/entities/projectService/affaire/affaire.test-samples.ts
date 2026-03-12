import dayjs from 'dayjs/esm';

import { StatutAffaire } from 'app/entities/enumerations/statut-affaire.model';

import { IAffaire, NewAffaire } from './affaire.model';

export const sampleWithRequiredData: IAffaire = {
  id: 16289,
  numAffaire: 44124,
  designationAffaire: 'Cambridgeshire modular',
  statut: StatutAffaire['Brouillon'],
};

export const sampleWithPartialData: IAffaire = {
  id: 76302,
  numAffaire: 90414,
  designationAffaire: 'navigating Frozen Tonga',
  montant: 60729,
  dateDebut: dayjs('2026-03-12'),
  dateCloture: dayjs('2026-03-11'),
  montantVente: 90911,
  montantBudgetaireMateriel: 52150,
  montantBudgetaireService: 35621,
  statut: StatutAffaire['Fin'],
  responsableProjetId: 'Incredible b',
  responsableProjetUserLogin: 'grey Profound Brunei',
  updatedAt: dayjs('2026-03-11T18:54'),
  updatedByUserLogin: 'distributed',
};

export const sampleWithFullData: IAffaire = {
  id: 95864,
  numAffaire: 55507,
  designationAffaire: 'Niger Outdoors',
  bonDeCommande: 'Fish metrics Plastic',
  montant: 28318,
  devise: "d'Argenteuil Paraguay",
  dateDebut: dayjs('2026-03-12'),
  dateCloture: dayjs('2026-03-11'),
  datePassageExecution: dayjs('2026-03-11'),
  lieuMultipleParMission: true,
  montantVente: 11925,
  montantBudgetaireMateriel: 90810,
  montantBudgetaireService: 85071,
  statut: StatutAffaire['EtudeOpportunite'],
  responsableProjetId: 'Pound c',
  responsableProjetUserLogin: 'a virtual',
  createdAt: dayjs('2026-03-11T19:25'),
  updatedAt: dayjs('2026-03-11T19:23'),
  createdBy: 'Awesome Cotton',
  createdByUserLogin: 'monetize paradigm b',
  updatedBy: 'a Refined',
  updatedByUserLogin: 'array JSON Architecte',
};

export const sampleWithNewData: NewAffaire = {
  numAffaire: 54003,
  designationAffaire: 'users Baby convergence',
  statut: StatutAffaire['ExecutionDesTravaux'],
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
