export interface IWorkOrderVehicule {
  id: number;
  workOrderId?: number | null;
  vehiculeId?: number | null;
}

export type NewWorkOrderVehicule = Omit<IWorkOrderVehicule, 'id'> & { id: null };
