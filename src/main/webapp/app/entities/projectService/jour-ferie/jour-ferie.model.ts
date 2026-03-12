import dayjs from 'dayjs/esm';

export interface IJourFerie {
  id: number;
  date?: dayjs.Dayjs | null;
  designation?: string | null;
  annee?: number | null;
}

export type NewJourFerie = Omit<IJourFerie, 'id'> & { id: null };
