import dayjs from 'dayjs/esm';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';

export interface IPieceJointe {
  id: number;
  nomFichier?: string | null;
  type?: string | null;
  fichierURL?: string | null;
  dateUpload?: dayjs.Dayjs | null;
  workOrderId?: number | null;
  affaire?: Pick<IAffaire, 'id' | 'designationAffaire'> | null;
}

export type NewPieceJointe = Omit<IPieceJointe, 'id'> & { id: null };
