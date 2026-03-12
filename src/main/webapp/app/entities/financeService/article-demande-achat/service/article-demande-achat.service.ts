import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IArticleDemandeAchat, NewArticleDemandeAchat } from '../article-demande-achat.model';

export type PartialUpdateArticleDemandeAchat = Partial<IArticleDemandeAchat> & Pick<IArticleDemandeAchat, 'id'>;

export type EntityResponseType = HttpResponse<IArticleDemandeAchat>;
export type EntityArrayResponseType = HttpResponse<IArticleDemandeAchat[]>;

@Injectable({ providedIn: 'root' })
export class ArticleDemandeAchatService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/article-demande-achats', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(articleDemandeAchat: NewArticleDemandeAchat): Observable<EntityResponseType> {
    return this.http.post<IArticleDemandeAchat>(this.resourceUrl, articleDemandeAchat, { observe: 'response' });
  }

  update(articleDemandeAchat: IArticleDemandeAchat): Observable<EntityResponseType> {
    return this.http.put<IArticleDemandeAchat>(
      `${this.resourceUrl}/${this.getArticleDemandeAchatIdentifier(articleDemandeAchat)}`,
      articleDemandeAchat,
      { observe: 'response' }
    );
  }

  partialUpdate(articleDemandeAchat: PartialUpdateArticleDemandeAchat): Observable<EntityResponseType> {
    return this.http.patch<IArticleDemandeAchat>(
      `${this.resourceUrl}/${this.getArticleDemandeAchatIdentifier(articleDemandeAchat)}`,
      articleDemandeAchat,
      { observe: 'response' }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IArticleDemandeAchat>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IArticleDemandeAchat[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getArticleDemandeAchatIdentifier(articleDemandeAchat: Pick<IArticleDemandeAchat, 'id'>): number {
    return articleDemandeAchat.id;
  }

  compareArticleDemandeAchat(o1: Pick<IArticleDemandeAchat, 'id'> | null, o2: Pick<IArticleDemandeAchat, 'id'> | null): boolean {
    return o1 && o2 ? this.getArticleDemandeAchatIdentifier(o1) === this.getArticleDemandeAchatIdentifier(o2) : o1 === o2;
  }

  addArticleDemandeAchatToCollectionIfMissing<Type extends Pick<IArticleDemandeAchat, 'id'>>(
    articleDemandeAchatCollection: Type[],
    ...articleDemandeAchatsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const articleDemandeAchats: Type[] = articleDemandeAchatsToCheck.filter(isPresent);
    if (articleDemandeAchats.length > 0) {
      const articleDemandeAchatCollectionIdentifiers = articleDemandeAchatCollection.map(
        articleDemandeAchatItem => this.getArticleDemandeAchatIdentifier(articleDemandeAchatItem)!
      );
      const articleDemandeAchatsToAdd = articleDemandeAchats.filter(articleDemandeAchatItem => {
        const articleDemandeAchatIdentifier = this.getArticleDemandeAchatIdentifier(articleDemandeAchatItem);
        if (articleDemandeAchatCollectionIdentifiers.includes(articleDemandeAchatIdentifier)) {
          return false;
        }
        articleDemandeAchatCollectionIdentifiers.push(articleDemandeAchatIdentifier);
        return true;
      });
      return [...articleDemandeAchatsToAdd, ...articleDemandeAchatCollection];
    }
    return articleDemandeAchatCollection;
  }
}
