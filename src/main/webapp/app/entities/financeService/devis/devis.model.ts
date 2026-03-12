import dayjs from 'dayjs/esm';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { StatutDevis } from 'app/entities/enumerations/statut-devis.model';

export interface IDevis {
  id: number;
  reference?: string | null;
  montant?: number | null;
  date?: dayjs.Dayjs | null;
  statut?: StatutDevis | null;
  workOrderId?: number | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
  facture?: Pick<IFacture, 'id' | 'numFacture'> | null;
}

export type NewDevis = Omit<IDevis, 'id'> & { id: null };
