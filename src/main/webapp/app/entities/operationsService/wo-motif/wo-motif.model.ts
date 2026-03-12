import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { IMotif } from 'app/entities/operationsService/motif/motif.model';

export interface IWoMotif {
  id: number;
  workOrder?: Pick<IWorkOrder, 'id'> | null;
  motif?: Pick<IMotif, 'id' | 'designation'> | null;
}

export type NewWoMotif = Omit<IWoMotif, 'id'> & { id: null };
