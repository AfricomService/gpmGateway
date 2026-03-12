import dayjs from 'dayjs/esm';

export interface IArticle {
  id: number;
  code?: string | null;
  designation?: string | null;
  uniteMesure?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewArticle = Omit<IArticle, 'id'> & { id: null };
