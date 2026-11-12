import dayjs from 'dayjs/esm';

export interface IWoArticles {
  id: number;
  woId?: number | null;
  articleId?: number | null;
  dateRealisation?: dayjs.Dayjs | null;
  qteCommande?: number | null;
  qteEffectuee?: number | null;
  prixArticle?: number | null;
  prixArticleHT?: number | null;
}
