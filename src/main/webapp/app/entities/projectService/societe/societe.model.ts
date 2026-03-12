import dayjs from 'dayjs/esm';

export interface ISociete {
  id: number;
  raisonSociale?: string | null;
  raisonSocialeAbrege?: string | null;
  identifiantUnique?: string | null;
  registreCommerce?: string | null;
  codeArticle?: string | null;
  adresse?: string | null;
  codePostal?: number | null;
  pays?: string | null;
  telephone?: string | null;
  fax?: string | null;
  email?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  createdBy?: string | null;
  createdByUserLogin?: string | null;
  updatedBy?: string | null;
  updatedByUserLogin?: string | null;
}

export type NewSociete = Omit<ISociete, 'id'> & { id: null };
