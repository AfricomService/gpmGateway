import dayjs from 'dayjs/esm';
import { StatutDemandeAchat } from 'app/entities/enumerations/statut-demande-achat.model';
import { TypeDemandeAchat } from 'app/entities/enumerations/type-demande-achat.model';

export interface IDemandeAchat {
  id: number;
  code?: string | null;
  statut?: StatutDemandeAchat | null;
  type?: TypeDemandeAchat | null;
  dateCreation?: dayjs.Dayjs | null;
  dateMiseADisposition?: dayjs.Dayjs | null;
  workOrderId?: number | null;
  affaireId?: number | null;
  demandeurId?: string | null;
  demandeurUserLogin?: string | null;
  validateurId?: string | null;
  validateurUserLogin?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewDemandeAchat = Omit<IDemandeAchat, 'id'> & { id: null };
