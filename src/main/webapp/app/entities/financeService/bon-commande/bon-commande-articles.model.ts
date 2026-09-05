import dayjs from 'dayjs/esm';

export interface IBonCommandeArticles {
  id: number;
  bonCommandeId?: number | null;
  articleId?: number | null;
  dateRealisation?: dayjs.Dayjs | null;
  qteCommande?: number | null;
  qteEffectuee?: number | null;
  prixArticle?: number | null;
}

export type NewBonCommandeArticles = Omit<IBonCommandeArticles, 'id'> & { id: null };
