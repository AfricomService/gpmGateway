import dayjs from 'dayjs/esm';

export interface IBonCommande {
  id: number;
  clientId?: number | null;
  affaireId?: number | null;
  lieu?: string | null;
  responsableId?: string | null;
  referenceClient?: string | null;
  dateBonCommande?: dayjs.Dayjs | null;
  montantTotal?: number | null;
  montantCommande?: number | null;
  montantConsomme?: number | null;
  montantMissionEffectue?: number | null;
}

export type NewBonCommande = Omit<IBonCommande, 'id'> & { id: null };
