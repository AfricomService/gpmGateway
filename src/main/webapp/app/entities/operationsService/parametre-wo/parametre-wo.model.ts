export interface IParametreWO {
  id: number;
  nom?: string | null;
  description?: string | null;
}

export type NewParametreWO = Omit<IParametreWO, 'id'> & { id: null };
