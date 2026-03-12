import dayjs from 'dayjs/esm';
import { IVille } from 'app/entities/projectService/ville/ville.model';
import { IClient } from 'app/entities/projectService/client/client.model';

export interface ISite {
  id: number;
  code?: string | null;
  designation?: string | null;
  gpsX?: number | null;
  gpsY?: number | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
  ville?: Pick<IVille, 'id' | 'nom'> | null;
  client?: Pick<IClient, 'id' | 'raisonSociale'> | null;
}

export type NewSite = Omit<ISite, 'id'> & { id: null };
