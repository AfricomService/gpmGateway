import { IVille } from 'app/entities/projectService/ville/ville.model';

export interface IZone {
  id: number;
  nom?: string | null;
  ville?: Pick<IVille, 'id' | 'nom'> | null;
}

export type NewZone = Omit<IZone, 'id'> & { id: null };
