import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITache, NewTache } from '../tache.model';

export type PartialUpdateTache = Partial<ITache> & Pick<ITache, 'id'>;

export type EntityResponseType = HttpResponse<ITache>;
export type EntityArrayResponseType = HttpResponse<ITache[]>;

@Injectable({ providedIn: 'root' })
export class TacheService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/taches', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(tache: NewTache): Observable<EntityResponseType> {
    return this.http.post<ITache>(this.resourceUrl, tache, { observe: 'response' });
  }

  update(tache: ITache): Observable<EntityResponseType> {
    return this.http.put<ITache>(`${this.resourceUrl}/${this.getTacheIdentifier(tache)}`, tache, { observe: 'response' });
  }

  partialUpdate(tache: PartialUpdateTache): Observable<EntityResponseType> {
    return this.http.patch<ITache>(`${this.resourceUrl}/${this.getTacheIdentifier(tache)}`, tache, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITache>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITache[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTacheIdentifier(tache: Pick<ITache, 'id'>): number {
    return tache.id;
  }

  compareTache(o1: Pick<ITache, 'id'> | null, o2: Pick<ITache, 'id'> | null): boolean {
    return o1 && o2 ? this.getTacheIdentifier(o1) === this.getTacheIdentifier(o2) : o1 === o2;
  }

  addTacheToCollectionIfMissing<Type extends Pick<ITache, 'id'>>(
    tacheCollection: Type[],
    ...tachesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const taches: Type[] = tachesToCheck.filter(isPresent);
    if (taches.length > 0) {
      const tacheCollectionIdentifiers = tacheCollection.map(tacheItem => this.getTacheIdentifier(tacheItem)!);
      const tachesToAdd = taches.filter(tacheItem => {
        const tacheIdentifier = this.getTacheIdentifier(tacheItem);
        if (tacheCollectionIdentifiers.includes(tacheIdentifier)) {
          return false;
        }
        tacheCollectionIdentifiers.push(tacheIdentifier);
        return true;
      });
      return [...tachesToAdd, ...tacheCollection];
    }
    return tacheCollection;
  }
}
