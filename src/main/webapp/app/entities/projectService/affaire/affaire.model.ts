import dayjs from 'dayjs/esm';
import { IClient } from 'app/entities/projectService/client/client.model';
import { StatutAffaire } from 'app/entities/enumerations/statut-affaire.model';

export interface IAffaire {
  id: number;
  numAffaire?: number | null;
  designationAffaire?: string | null;
  bonDeCommande?: string | null;
  montant?: number | null;
  devise?: string | null;
  dateDebut?: dayjs.Dayjs | null;
  dateCloture?: dayjs.Dayjs | null;
  datePassageExecution?: dayjs.Dayjs | null;
  lieuMultipleParMission?: boolean | null;
  montantVente?: number | null;
  montantBudgetaireMateriel?: number | null;
  montantBudgetaireService?: number | null;
  statut?: StatutAffaire | null;
  responsableProjetId?: string | null;
  responsableProjetUserLogin?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
  client?: Pick<IClient, 'id' | 'raisonSociale'> | null;
}

export type NewAffaire = Omit<IAffaire, 'id'> & { id: null };
