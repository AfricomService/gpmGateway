import dayjs from 'dayjs/esm';

export interface IDepenseDiverse {
  id: number;
  motif?: string | null;
  montant?: number | null;
  date?: dayjs.Dayjs | null;
  justificatif?: string | null;
  workOrderId?: number | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewDepenseDiverse = Omit<IDepenseDiverse, 'id'> & { id: null };
