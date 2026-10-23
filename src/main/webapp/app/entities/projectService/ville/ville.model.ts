export interface IVille {
  id: number;
  nom?: string | null;
  zoneId?: number;
}

export type NewVille = Omit<IVille, 'id'> & { id: null };
