import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { IArticle } from 'app/entities/projectService/article/article.model';

export interface IAffaireArticle {
  id: number;
  quantiteContractuelle?: number | null;
  quantiteRealisee?: number | null;
  affaire?: Pick<IAffaire, 'id' | 'designationAffaire'> | null;
  article?: Pick<IArticle, 'id' | 'code'> | null;
}

export type NewAffaireArticle = Omit<IAffaireArticle, 'id'> & { id: null };
