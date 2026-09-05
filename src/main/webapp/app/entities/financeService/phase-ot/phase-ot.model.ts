import dayjs from 'dayjs/esm';

export interface IPhaseOt {
  id: number;
  nom?: string | null;
  description?: string | null;
  duree?: number | null;
  bloquante?: boolean | null;
  statut?: string | null;
  dateDebut?: dayjs.Dayjs | null;
  dl?: dayjs.Dayjs | null;
  dlc?: dayjs.Dayjs | null;
  phaseParentId?: number | null;
}

export type NewPhaseOt = Omit<IPhaseOt, 'id'> & { id: null };
