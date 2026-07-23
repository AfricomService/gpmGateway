export interface INumsequentielle {
  id: number;
  prefix?: string | null;
  nextNumber?: string | null;
  format?: string | null;
  codeNumSeq?: string | null;
}

export type NewNumsequentielle = Omit<INumsequentielle, 'id'> & { id: null };
