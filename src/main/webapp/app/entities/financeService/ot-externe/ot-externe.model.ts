import dayjs from 'dayjs/esm';
import { StatutOtExterne } from 'app/entities/enumerations/statut-ot-externe.model';

export interface IOtExterne {
  id: number;
  reference?: string | null;
  statut?: StatutOtExterne | null;
  affaireId?: number | null;
  clientId?: number | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewOtExterne = Omit<IOtExterne, 'id'> & { id: null };
