import { IDemandeAchat } from 'app/entities/financeService/demande-achat/demande-achat.model';
import { TypeArticleDemandeAchat } from 'app/entities/enumerations/type-article-demande-achat.model';

export interface IArticleDemandeAchat {
  id: number;
  qteDemandee?: number | null;
  type?: TypeArticleDemandeAchat | null;
  articleCode?: string | null;
  demandeAchat?: Pick<IDemandeAchat, 'id' | 'code'> | null;
}

export type NewArticleDemandeAchat = Omit<IArticleDemandeAchat, 'id'> & { id: null };
