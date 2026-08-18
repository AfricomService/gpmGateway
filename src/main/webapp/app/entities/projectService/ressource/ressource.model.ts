import dayjs from 'dayjs/esm';

export interface IRessource {
  id: number;
  nom?: string | null;
  code?: string | null;
  categorie?: string | null;
  description?: string | null;
  dateMiseEnService?: dayjs.Dayjs | null;
  dateDerniereMaintenance?: dayjs.Dayjs | null;
  dateProchaineMaintenance?: dayjs.Dayjs | null;
  typeRessourceId?: number | null;
  statut?: string | null;
}

export type NewRessource = Omit<IRessource, 'id'> & { id: null };
