import dayjs from 'dayjs/esm';

export interface INoteFrais {
  id: number;
  dateDebut?: dayjs.Dayjs | null;
  dateFin?: dayjs.Dayjs | null;
  contactSocieteId?: number | null;
  montantTotale?: number | null;
  montantTotaleEnLettre?: string | null;
  identifiantUnique?: string | null;
}

export type NewNoteFrais = Omit<INoteFrais, 'id'> & { id: null };
