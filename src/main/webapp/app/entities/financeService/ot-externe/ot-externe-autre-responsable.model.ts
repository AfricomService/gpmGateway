export interface IOtExterneAutreResponsable {
  id: number;
  otExterneId?: number | null;
  contactSocieteId?: number | null;
}

export type NewOtExterneAutreResponsable = Omit<IOtExterneAutreResponsable, 'id'> & { id: null };
