import { IFacture } from 'app/entities/financeService/facture/facture.model';

export interface IFactureWO {
  id: number;
  pourcentageFacture?: number | null;
  montantFacture?: number | null;
  remarque?: string | null;
  workOrderId?: number | null;
  facture?: Pick<IFacture, 'id' | 'numFacture'> | null;
}

export type NewFactureWO = Omit<IFactureWO, 'id'> & { id: null };
