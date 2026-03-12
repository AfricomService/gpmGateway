import dayjs from 'dayjs/esm';
import { StatutFraisDeMission } from 'app/entities/enumerations/statut-frais-de-mission.model';

export interface IFraisDeMission {
  id: number;
  dateDebut?: dayjs.Dayjs | null;
  dateFin?: dayjs.Dayjs | null;
  montantTotal?: number | null;
  avanceRecue?: number | null;
  netAPayer?: number | null;
  noteRendement?: number | null;
  noteQualite?: number | null;
  noteConduite?: number | null;
  noteTotale?: number | null;
  bonusExtra?: number | null;
  justificatifBonus?: string | null;
  justificatifModification?: string | null;
  statut?: StatutFraisDeMission | null;
  workOrderId?: number | null;
  beneficiaireId?: string | null;
  beneficiaireUserLogin?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewFraisDeMission = Omit<IFraisDeMission, 'id'> & { id: null };
