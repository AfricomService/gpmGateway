import dayjs from 'dayjs/esm';
import { StatutFacture } from 'app/entities/enumerations/statut-facture.model';

export interface IFacture {
  id: number;
  numFacture?: string | null;
  bonDeCommande?: string | null;
  montantFacture?: number | null;
  dateFacture?: dayjs.Dayjs | null;
  dateEcheance?: dayjs.Dayjs | null;
  dateDecharge?: dayjs.Dayjs | null;
  statut?: StatutFacture | null;
  clientId?: number | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewFacture = Omit<IFacture, 'id'> & { id: null };
