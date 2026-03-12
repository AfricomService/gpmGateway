import dayjs from 'dayjs/esm';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

export interface IHistoriqueStatutWO {
  id: number;
  ancienStatut?: StatutWO | null;
  nouveauStatut?: StatutWO | null;
  dateChangement?: dayjs.Dayjs | null;
  commentaire?: string | null;
  userId?: string | null;
  userLogin?: string | null;
  workOrder?: Pick<IWorkOrder, 'id'> | null;
}

export type NewHistoriqueStatutWO = Omit<IHistoriqueStatutWO, 'id'> & { id: null };
