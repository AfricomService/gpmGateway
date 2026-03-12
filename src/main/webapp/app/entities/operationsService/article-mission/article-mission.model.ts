import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';

export interface IArticleMission {
  id: number;
  item?: number | null;
  quantitePlanifiee?: number | null;
  quantiteRealisee?: number | null;
  articleCode?: string | null;
  workOrder?: Pick<IWorkOrder, 'id'> | null;
}

export type NewArticleMission = Omit<IArticleMission, 'id'> & { id: null };
