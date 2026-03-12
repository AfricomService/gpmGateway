import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { IVille } from 'app/entities/projectService/ville/ville.model';
import { IZone } from 'app/entities/projectService/zone/zone.model';

export interface IMatriceFacturation {
  id: number;
  tarifBase?: number | null;
  tarifMissionNuit?: number | null;
  tarifHebergement?: number | null;
  tarifJourFerie?: number | null;
  tarifDimanche?: number | null;
  affaire?: Pick<IAffaire, 'id' | 'designationAffaire'> | null;
  ville?: Pick<IVille, 'id' | 'nom'> | null;
  zone?: Pick<IZone, 'id' | 'nom'> | null;
}

export type NewMatriceFacturation = Omit<IMatriceFacturation, 'id'> & { id: null };
