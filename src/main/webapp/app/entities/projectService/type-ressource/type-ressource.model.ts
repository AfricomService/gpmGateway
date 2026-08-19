export interface ITypeRessource {
  id: number;
  type?: string | null;
  code?: string | null;
}

export type NewTypeRessource = Omit<ITypeRessource, 'id'> & { id: null };
