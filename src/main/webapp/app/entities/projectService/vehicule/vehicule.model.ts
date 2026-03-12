import dayjs from 'dayjs/esm';
import { IAgence } from 'app/entities/projectService/agence/agence.model';
import { StatutVehicule } from 'app/entities/enumerations/statut-vehicule.model';

export interface IVehicule {
  id: number;
  marque?: string | null;
  type?: string | null;
  matricule?: string | null;
  nbPlaces?: number | null;
  numCarteGrise?: string | null;
  dateCirculation?: dayjs.Dayjs | null;
  typeCarburant?: string | null;
  chargeFixe?: number | null;
  tauxConsommation?: number | null;
  statut?: StatutVehicule | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
  agence?: Pick<IAgence, 'id' | 'designation'> | null;
}

export type NewVehicule = Omit<IVehicule, 'id'> & { id: null };
