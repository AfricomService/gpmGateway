import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAffaireArticle, NewAffaireArticle } from '../affaire-article.model';

export type PartialUpdateAffaireArticle = Partial<IAffaireArticle> & Pick<IAffaireArticle, 'id'>;

export type EntityResponseType = HttpResponse<IAffaireArticle>;
export type EntityArrayResponseType = HttpResponse<IAffaireArticle[]>;

@Injectable({ providedIn: 'root' })
export class AffaireArticleService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/affaire-articles', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(affaireArticle: NewAffaireArticle): Observable<EntityResponseType> {
    return this.http.post<IAffaireArticle>(this.resourceUrl, affaireArticle, { observe: 'response' });
  }

  update(affaireArticle: IAffaireArticle): Observable<EntityResponseType> {
    return this.http.put<IAffaireArticle>(`${this.resourceUrl}/${this.getAffaireArticleIdentifier(affaireArticle)}`, affaireArticle, {
      observe: 'response',
    });
  }

  partialUpdate(affaireArticle: PartialUpdateAffaireArticle): Observable<EntityResponseType> {
    return this.http.patch<IAffaireArticle>(`${this.resourceUrl}/${this.getAffaireArticleIdentifier(affaireArticle)}`, affaireArticle, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IAffaireArticle>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAffaireArticle[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getAffaireArticleIdentifier(affaireArticle: Pick<IAffaireArticle, 'id'>): number {
    return affaireArticle.id;
  }

  compareAffaireArticle(o1: Pick<IAffaireArticle, 'id'> | null, o2: Pick<IAffaireArticle, 'id'> | null): boolean {
    return o1 && o2 ? this.getAffaireArticleIdentifier(o1) === this.getAffaireArticleIdentifier(o2) : o1 === o2;
  }

  addAffaireArticleToCollectionIfMissing<Type extends Pick<IAffaireArticle, 'id'>>(
    affaireArticleCollection: Type[],
    ...affaireArticlesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const affaireArticles: Type[] = affaireArticlesToCheck.filter(isPresent);
    if (affaireArticles.length > 0) {
      const affaireArticleCollectionIdentifiers = affaireArticleCollection.map(
        affaireArticleItem => this.getAffaireArticleIdentifier(affaireArticleItem)!
      );
      const affaireArticlesToAdd = affaireArticles.filter(affaireArticleItem => {
        const affaireArticleIdentifier = this.getAffaireArticleIdentifier(affaireArticleItem);
        if (affaireArticleCollectionIdentifiers.includes(affaireArticleIdentifier)) {
          return false;
        }
        affaireArticleCollectionIdentifiers.push(affaireArticleIdentifier);
        return true;
      });
      return [...affaireArticlesToAdd, ...affaireArticleCollection];
    }
    return affaireArticleCollection;
  }
}
