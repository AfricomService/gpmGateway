import dayjs from 'dayjs/esm';

export interface IDemandeEspece {
  id: number;
  montant?: number | null;
  motif?: string | null;
  workOrderId?: number | null;
  beneficiaireId?: string | null;
  beneficiaireUserLogin?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewDemandeEspece = Omit<IDemandeEspece, 'id'> & { id: null };
