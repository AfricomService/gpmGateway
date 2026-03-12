import dayjs from 'dayjs/esm';

export interface IActivite {
  id: number;
  code?: string | null;
  designation?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewActivite = Omit<IActivite, 'id'> & { id: null };
