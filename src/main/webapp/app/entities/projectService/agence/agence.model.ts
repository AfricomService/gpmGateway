import dayjs from 'dayjs/esm';
import { ISociete } from 'app/entities/projectService/societe/societe.model';

export interface IAgence {
  id: number;
  designation?: string | null;
  adresse?: string | null;
  ville?: string | null;
  pays?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
  societe?: Pick<ISociete, 'id' | 'raisonSociale'> | null;
}

export type NewAgence = Omit<IAgence, 'id'> & { id: null };
