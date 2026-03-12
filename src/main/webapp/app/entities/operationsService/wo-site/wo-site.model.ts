import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';

export interface IWoSite {
  id: number;
  siteCode?: string | null;
  workOrder?: Pick<IWorkOrder, 'id'> | null;
}

export type NewWoSite = Omit<IWoSite, 'id'> & { id: null };
