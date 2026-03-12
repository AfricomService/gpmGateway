import dayjs from 'dayjs/esm';
import { StatutWO } from 'app/entities/enumerations/statut-wo.model';

export interface IWorkOrder {
  id: number;
  clientId?: number | null;
  affaireId?: number | null;
  demandeurContactId?: number | null;
  vehiculeId?: number | null;
  otExterneId?: number | null;
  valideurId?: string | null;
  valideurUserLogin?: string | null;
  dateHeureDebutPrev?: dayjs.Dayjs | null;
  dateHeureFinPrev?: dayjs.Dayjs | null;
  dateHeureDebutReel?: dayjs.Dayjs | null;
  dateHeureFinReel?: dayjs.Dayjs | null;
  missionDeNuit?: boolean | null;
  nombreNuits?: number | null;
  hebergement?: boolean | null;
  nombreHebergements?: number | null;
  remarque?: string | null;
  numFicheIntervention?: string | null;
  statut?: StatutWO | null;
  materielUtilise?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewWorkOrder = Omit<IWorkOrder, 'id'> & { id: null };
