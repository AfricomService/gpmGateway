import { ISociete } from './societe.model';

export interface IPersonne {
  id?: number;
  matricule?: string | null;
  nomPrenom?: string | null;
  email?: string | null;
  numTelephone?: string | null;
  genre?: string | null;
  cin?: string | null;
  idContratActif?: number | null;
  idTypeContratActif?: number | null;
  userId?: string | null;
  gradeId?: number | null;
  fonctionId?: number | null;
}

export class Personne implements IPersonne {
  constructor(
    public id?: number,
    public matricule?: string | null,
    public nomPrenom?: string | null,
    public email?: string | null,
    public numTelephone?: string | null,
    public genre?: string | null,
    public cin?: string | null,
    public idContratActif?: number | null,
    public idTypeContratActif?: number | null,
    public userId?: string | null,
    public gradeId?: number | null,
    public fonctionId?: number | null
  ) {}
}

export function getPersonneIdentifier(personne: IPersonne): number | undefined {
  return personne.id;
}
