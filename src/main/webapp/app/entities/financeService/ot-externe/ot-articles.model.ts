import dayjs from 'dayjs/esm';

export interface IOtArticles {
  id: number;
  otId?: number | null;
  articleId?: number | null;
  prixPropose?: number | null;
  dateAffectation?: dayjs.Dayjs | null;
  qteCommandee?: number | null;
  qteRealisee?: number | null;
  phaseOtId?: number | null;
}

export type NewOtArticles = Omit<IOtArticles, 'id'> & { id: null };
