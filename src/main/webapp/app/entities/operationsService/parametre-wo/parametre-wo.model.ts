export interface IParametreWO {
  id: number;
  nom?: string | null;
  description?: string | null;
  montantTechnicien?: number | null;
  montantChefTechnicien?: number | null;
}

export type NewParametreWO = Omit<IParametreWO, 'id'> & { id: null };
