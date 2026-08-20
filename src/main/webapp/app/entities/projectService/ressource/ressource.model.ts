import dayjs from 'dayjs/esm';

export interface IRessourceAdditionalInfo {
  code?: string | null;
  label?: string | null;
  inputType?: string | null;
  value?: string | null;
}

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
  additionalInfo?: IRessourceAdditionalInfo[] | null;
}

export type NewRessource = Omit<IRessource, 'id'> & { id: null };
