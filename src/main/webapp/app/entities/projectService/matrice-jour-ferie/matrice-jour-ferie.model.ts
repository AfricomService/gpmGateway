import { IMatriceFacturation } from 'app/entities/projectService/matrice-facturation/matrice-facturation.model';
import { IJourFerie } from 'app/entities/projectService/jour-ferie/jour-ferie.model';

export interface IMatriceJourFerie {
  id: number;
  tarifApplique?: number | null;
  matrice?: Pick<IMatriceFacturation, 'id'> | null;
  jourFerie?: Pick<IJourFerie, 'id' | 'designation'> | null;
}

export type NewMatriceJourFerie = Omit<IMatriceJourFerie, 'id'> & { id: null };
