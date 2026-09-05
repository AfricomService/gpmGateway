import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IBonCommandeArticles, NewBonCommandeArticles } from '../bon-commande-articles.model';

export type PartialUpdateBonCommandeArticles = Partial<IBonCommandeArticles> & Pick<IBonCommandeArticles, 'id'>;

type RestOf<T extends IBonCommandeArticles | NewBonCommandeArticles> = Omit<T, 'dateRealisation'> & {
  dateRealisation?: string | null;
};

export type RestBonCommandeArticles = RestOf<IBonCommandeArticles>;

export type NewRestBonCommandeArticles = RestOf<NewBonCommandeArticles>;

export type PartialUpdateRestBonCommandeArticles = RestOf<PartialUpdateBonCommandeArticles>;

export type EntityResponseType = HttpResponse<IBonCommandeArticles>;
export type EntityArrayResponseType = HttpResponse<IBonCommandeArticles[]>;

@Injectable({ providedIn: 'root' })
export class BonCommandeArticlesService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/bon-commande-articles', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(bonCommandeArticles: NewBonCommandeArticles): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bonCommandeArticles);
    return this.http
      .post<RestBonCommandeArticles>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(bonCommandeArticles: IBonCommandeArticles): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bonCommandeArticles);
    return this.http
      .put<RestBonCommandeArticles>(`${this.resourceUrl}/${this.getBonCommandeArticlesIdentifier(bonCommandeArticles)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(bonCommandeArticles: PartialUpdateBonCommandeArticles): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bonCommandeArticles);
    return this.http
      .patch<RestBonCommandeArticles>(`${this.resourceUrl}/${this.getBonCommandeArticlesIdentifier(bonCommandeArticles)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestBonCommandeArticles>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestBonCommandeArticles[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  /**
   * Récupère les articles affectés à un bon de commande.
   */
  findByBonCommande(bonCommandeId: number): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestBonCommandeArticles[]>(`${this.resourceUrl}/by-bon-commande/${bonCommandeId}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /**
   * Remplace intégralement la liste des articles affectés à un bon de commande.
   */
  replaceForBonCommande(bonCommandeId: number, bonCommandeArticles: Partial<IBonCommandeArticles>[]): Observable<EntityArrayResponseType> {
    return this.http
      .put<RestBonCommandeArticles[]>(`${this.resourceUrl}/bon-commande/${bonCommandeId}`, bonCommandeArticles, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  getBonCommandeArticlesIdentifier(bonCommandeArticles: Pick<IBonCommandeArticles, 'id'>): number {
    return bonCommandeArticles.id;
  }

  compareBonCommandeArticles(o1: Pick<IBonCommandeArticles, 'id'> | null, o2: Pick<IBonCommandeArticles, 'id'> | null): boolean {
    return o1 && o2 ? this.getBonCommandeArticlesIdentifier(o1) === this.getBonCommandeArticlesIdentifier(o2) : o1 === o2;
  }

  addBonCommandeArticlesToCollectionIfMissing<Type extends Pick<IBonCommandeArticles, 'id'>>(
    bonCommandeArticlesCollection: Type[],
    ...bonCommandeArticlesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const bonCommandeArticles: Type[] = bonCommandeArticlesToCheck.filter(isPresent);
    if (bonCommandeArticles.length > 0) {
      const bonCommandeArticlesCollectionIdentifiers = bonCommandeArticlesCollection.map(
        bonCommandeArticlesItem => this.getBonCommandeArticlesIdentifier(bonCommandeArticlesItem)!
      );
      const bonCommandeArticlesToAdd = bonCommandeArticles.filter(bonCommandeArticlesItem => {
        const bonCommandeArticlesIdentifier = this.getBonCommandeArticlesIdentifier(bonCommandeArticlesItem);
        if (bonCommandeArticlesCollectionIdentifiers.includes(bonCommandeArticlesIdentifier)) {
          return false;
        }
        bonCommandeArticlesCollectionIdentifiers.push(bonCommandeArticlesIdentifier);
        return true;
      });
      return [...bonCommandeArticlesToAdd, ...bonCommandeArticlesCollection];
    }
    return bonCommandeArticlesCollection;
  }

  protected convertDateFromClient<T extends IBonCommandeArticles | NewBonCommandeArticles | PartialUpdateBonCommandeArticles>(
    bonCommandeArticles: T
  ): RestOf<T> {
    return {
      ...bonCommandeArticles,
      dateRealisation: bonCommandeArticles.dateRealisation?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restBonCommandeArticles: RestBonCommandeArticles): IBonCommandeArticles {
    return {
      ...restBonCommandeArticles,
      dateRealisation: restBonCommandeArticles.dateRealisation ? dayjs(restBonCommandeArticles.dateRealisation) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestBonCommandeArticles>): HttpResponse<IBonCommandeArticles> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestBonCommandeArticles[]>): HttpResponse<IBonCommandeArticles[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
