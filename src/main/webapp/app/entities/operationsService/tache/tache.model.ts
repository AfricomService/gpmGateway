import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { IActivite } from 'app/entities/operationsService/activite/activite.model';

export interface ITache {
  id: number;
  roleDansLaMission?: string | null;
  note?: number | null;
  remboursement?: number | null;
  executeurId?: string | null;
  executeurUserLogin?: string | null;
  workOrder?: Pick<IWorkOrder, 'id'> | null;
  activite?: Pick<IActivite, 'id' | 'designation'> | null;
}

export type NewTache = Omit<ITache, 'id'> & { id: null };
