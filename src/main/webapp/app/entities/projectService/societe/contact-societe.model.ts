export interface IContactSociete {
  id?: number;
  matricule?: string | null;
  nomPrenom?: string | null;
  email?: string | null;
  numTel?: string | null;
  societeId?: number | null;
  statusCompteKeycloak?: string | null;
}

export class ContactSociete implements IContactSociete {
  constructor(
    public id?: number,
    public matricule?: string | null,
    public nomPrenom?: string | null,
    public email?: string | null,
    public numTel?: string | null,
    public societeId?: number | null,
    public statusCompteKeycloak?: string | null
  ) {}
}

export function getContactSocieteIdentifier(contactSociete: Pick<IContactSociete, 'id'>): number | undefined {
  return contactSociete.id;
}
