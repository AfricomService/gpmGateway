export interface IContactSociete {
  id?: number;
  matricule?: string | null;
  nomPrenom?: string | null;
  email?: string | null;
  numTel?: string | null;
  societeId?: number | null;
}

export class ContactSociete implements IContactSociete {
  constructor(
    public id?: number,
    public matricule?: string | null,
    public nomPrenom?: string | null,
    public email?: string | null,
    public numTel?: string | null,
    public societeId?: number | null
  ) {}
}

export function getContactSocieteIdentifier(contactSociete: Pick<IContactSociete, 'id'>): number | undefined {
  return contactSociete.id;
}
