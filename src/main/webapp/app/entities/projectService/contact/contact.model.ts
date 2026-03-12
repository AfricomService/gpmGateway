import dayjs from 'dayjs/esm';
import { IClient } from 'app/entities/projectService/client/client.model';

export interface IContact {
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
  client?: Pick<IClient, 'id' | 'raisonSociale'> | null;
}

export type NewContact = Omit<IContact, 'id'> & { id: null };
