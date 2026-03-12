import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IActivite, NewActivite } from '../activite.model';

export type PartialUpdateActivite = Partial<IActivite> & Pick<IActivite, 'id'>;

type RestOf<T extends IActivite | NewActivite> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestActivite = RestOf<IActivite>;

export type NewRestActivite = RestOf<NewActivite>;

export type PartialUpdateRestActivite = RestOf<PartialUpdateActivite>;

export type EntityResponseType = HttpResponse<IActivite>;
export type EntityArrayResponseType = HttpResponse<IActivite[]>;

@Injectable({ providedIn: 'root' })
export class ActiviteService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/activites', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(activite: NewActivite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activite);
    return this.http
      .post<RestActivite>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(activite: IActivite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activite);
    return this.http
      .put<RestActivite>(`${this.resourceUrl}/${this.getActiviteIdentifier(activite)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(activite: PartialUpdateActivite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activite);
    return this.http
      .patch<RestActivite>(`${this.resourceUrl}/${this.getActiviteIdentifier(activite)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestActivite>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestActivite[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getActiviteIdentifier(activite: Pick<IActivite, 'id'>): number {
    return activite.id;
  }

  compareActivite(o1: Pick<IActivite, 'id'> | null, o2: Pick<IActivite, 'id'> | null): boolean {
    return o1 && o2 ? this.getActiviteIdentifier(o1) === this.getActiviteIdentifier(o2) : o1 === o2;
  }

  addActiviteToCollectionIfMissing<Type extends Pick<IActivite, 'id'>>(
    activiteCollection: Type[],
    ...activitesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const activites: Type[] = activitesToCheck.filter(isPresent);
    if (activites.length > 0) {
      const activiteCollectionIdentifiers = activiteCollection.map(activiteItem => this.getActiviteIdentifier(activiteItem)!);
      const activitesToAdd = activites.filter(activiteItem => {
        const activiteIdentifier = this.getActiviteIdentifier(activiteItem);
        if (activiteCollectionIdentifiers.includes(activiteIdentifier)) {
          return false;
        }
        activiteCollectionIdentifiers.push(activiteIdentifier);
        return true;
      });
      return [...activitesToAdd, ...activiteCollection];
    }
    return activiteCollection;
  }

  protected convertDateFromClient<T extends IActivite | NewActivite | PartialUpdateActivite>(activite: T): RestOf<T> {
    return {
      ...activite,
      createdAt: activite.createdAt?.toJSON() ?? null,
      updatedAt: activite.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restActivite: RestActivite): IActivite {
    return {
      ...restActivite,
      createdAt: restActivite.createdAt ? dayjs(restActivite.createdAt) : undefined,
      updatedAt: restActivite.updatedAt ? dayjs(restActivite.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestActivite>): HttpResponse<IActivite> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestActivite[]>): HttpResponse<IActivite[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
