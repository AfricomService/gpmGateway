import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';

export interface IWoUtilisateur {
  id: number;
  role?: string | null;
  userId?: string | null;
  userLogin?: string | null;
  workOrder?: Pick<IWorkOrder, 'id'> | null;
}

export type NewWoUtilisateur = Omit<IWoUtilisateur, 'id'> & { id: null };
