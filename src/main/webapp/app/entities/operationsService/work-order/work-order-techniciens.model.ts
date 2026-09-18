export interface IWorkOrderTechniciens {
  id: number;
  workOrderId?: number | null;
  contactSocieteId?: number | null;
}

export type NewWorkOrderTechniciens = Omit<IWorkOrderTechniciens, 'id'> & { id: null };
