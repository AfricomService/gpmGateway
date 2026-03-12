import dayjs from 'dayjs/esm';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';

export interface ISST {
  id: number;
  label?: string | null;
  date?: dayjs.Dayjs | null;
  importance?: string | null;
  commentaire?: string | null;
  incidentPresent?: boolean | null;
  arretTravail?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
  workOrder?: Pick<IWorkOrder, 'id'> | null;
}

export type NewSST = Omit<ISST, 'id'> & { id: null };
