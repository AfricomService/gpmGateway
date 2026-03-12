import dayjs from 'dayjs/esm';

export interface IClient {
  id: number;
  raisonSociale?: string | null;
  identifiantUnique?: string | null;
  adresse?: string | null;
  telephone?: string | null;
  fax?: string | null;
  email?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewClient = Omit<IClient, 'id'> & { id: null };
