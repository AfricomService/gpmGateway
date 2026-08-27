export interface IModelPhaseOT {
  id: number;
  nom?: string | null;
  description?: string | null;
}

export type NewModelPhaseOT = Omit<IModelPhaseOT, 'id'> & { id: null };
