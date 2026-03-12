import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAgence, NewAgence } from '../agence.model';

export type PartialUpdateAgence = Partial<IAgence> & Pick<IAgence, 'id'>;

type RestOf<T extends IAgence | NewAgence> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestAgence = RestOf<IAgence>;

export type NewRestAgence = RestOf<NewAgence>;

export type PartialUpdateRestAgence = RestOf<PartialUpdateAgence>;

export type EntityResponseType = HttpResponse<IAgence>;
export type EntityArrayResponseType = HttpResponse<IAgence[]>;

@Injectable({ providedIn: 'root' })
export class AgenceService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/agences', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(agence: NewAgence): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(agence);
    return this.http
      .post<RestAgence>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(agence: IAgence): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(agence);
    return this.http
      .put<RestAgence>(`${this.resourceUrl}/${this.getAgenceIdentifier(agence)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(agence: PartialUpdateAgence): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(agence);
    return this.http
      .patch<RestAgence>(`${this.resourceUrl}/${this.getAgenceIdentifier(agence)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestAgence>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAgence[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getAgenceIdentifier(agence: Pick<IAgence, 'id'>): number {
    return agence.id;
  }

  compareAgence(o1: Pick<IAgence, 'id'> | null, o2: Pick<IAgence, 'id'> | null): boolean {
    return o1 && o2 ? this.getAgenceIdentifier(o1) === this.getAgenceIdentifier(o2) : o1 === o2;
  }

  addAgenceToCollectionIfMissing<Type extends Pick<IAgence, 'id'>>(
    agenceCollection: Type[],
    ...agencesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const agences: Type[] = agencesToCheck.filter(isPresent);
    if (agences.length > 0) {
      const agenceCollectionIdentifiers = agenceCollection.map(agenceItem => this.getAgenceIdentifier(agenceItem)!);
      const agencesToAdd = agences.filter(agenceItem => {
        const agenceIdentifier = this.getAgenceIdentifier(agenceItem);
        if (agenceCollectionIdentifiers.includes(agenceIdentifier)) {
          return false;
        }
        agenceCollectionIdentifiers.push(agenceIdentifier);
        return true;
      });
      return [...agencesToAdd, ...agenceCollection];
    }
    return agenceCollection;
  }

  protected convertDateFromClient<T extends IAgence | NewAgence | PartialUpdateAgence>(agence: T): RestOf<T> {
    return {
      ...agence,
      createdAt: agence.createdAt?.toJSON() ?? null,
      updatedAt: agence.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restAgence: RestAgence): IAgence {
    return {
      ...restAgence,
      createdAt: restAgence.createdAt ? dayjs(restAgence.createdAt) : undefined,
      updatedAt: restAgence.updatedAt ? dayjs(restAgence.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestAgence>): HttpResponse<IAgence> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAgence[]>): HttpResponse<IAgence[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
