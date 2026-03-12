import dayjs from 'dayjs/esm';

export interface IMotif {
  id: number;
  designation?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewMotif = Omit<IMotif, 'id'> & { id: null };
