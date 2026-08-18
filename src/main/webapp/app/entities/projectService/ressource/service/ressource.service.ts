import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IRessource, NewRessource } from '../ressource.model';

export type PartialUpdateRessource = Partial<IRessource> & Pick<IRessource, 'id'>;

type RestOf<T extends IRessource | NewRessource> = Omit<T, 'dateMiseEnService' | 'dateDerniereMaintenance' | 'dateProchaineMaintenance'> & {
  dateMiseEnService?: string | null;
  dateDerniereMaintenance?: string | null;
  dateProchaineMaintenance?: string | null;
};

export type RestRessource = RestOf<IRessource>;

export type NewRestRessource = RestOf<NewRessource>;

export type PartialUpdateRestRessource = RestOf<PartialUpdateRessource>;

export type EntityResponseType = HttpResponse<IRessource>;
export type EntityArrayResponseType = HttpResponse<IRessource[]>;

@Injectable({ providedIn: 'root' })
export class RessourceService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/ressources', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(ressource: NewRessource): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(ressource);
    return this.http
      .post<RestRessource>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(ressource: IRessource): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(ressource);
    return this.http
      .put<RestRessource>(`${this.resourceUrl}/${this.getRessourceIdentifier(ressource)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(ressource: PartialUpdateRessource): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(ressource);
    return this.http
      .patch<RestRessource>(`${this.resourceUrl}/${this.getRessourceIdentifier(ressource)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestRessource>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestRessource[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getRessourceIdentifier(ressource: Pick<IRessource, 'id'>): number {
    return ressource.id;
  }

  compareRessource(o1: Pick<IRessource, 'id'> | null, o2: Pick<IRessource, 'id'> | null): boolean {
    return o1 && o2 ? this.getRessourceIdentifier(o1) === this.getRessourceIdentifier(o2) : o1 === o2;
  }

  addRessourceToCollectionIfMissing<Type extends Pick<IRessource, 'id'>>(
    ressourceCollection: Type[],
    ...ressourcesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const ressources: Type[] = ressourcesToCheck.filter(isPresent);
    if (ressources.length > 0) {
      const ressourceCollectionIdentifiers = ressourceCollection.map(ressourceItem => this.getRessourceIdentifier(ressourceItem)!);
      const ressourcesToAdd = ressources.filter(ressourceItem => {
        const ressourceIdentifier = this.getRessourceIdentifier(ressourceItem);
        if (ressourceCollectionIdentifiers.includes(ressourceIdentifier)) {
          return false;
        }
        ressourceCollectionIdentifiers.push(ressourceIdentifier);
        return true;
      });
      return [...ressourcesToAdd, ...ressourceCollection];
    }
    return ressourceCollection;
  }

  protected convertDateFromClient<T extends IRessource | NewRessource | PartialUpdateRessource>(ressource: T): RestOf<T> {
    return {
      ...ressource,
      dateMiseEnService: ressource.dateMiseEnService?.toJSON() ?? null,
      dateDerniereMaintenance: ressource.dateDerniereMaintenance?.toJSON() ?? null,
      dateProchaineMaintenance: ressource.dateProchaineMaintenance?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restRessource: RestRessource): IRessource {
    return {
      ...restRessource,
      dateMiseEnService: restRessource.dateMiseEnService ? dayjs(restRessource.dateMiseEnService) : undefined,
      dateDerniereMaintenance: restRessource.dateDerniereMaintenance ? dayjs(restRessource.dateDerniereMaintenance) : undefined,
      dateProchaineMaintenance: restRessource.dateProchaineMaintenance ? dayjs(restRessource.dateProchaineMaintenance) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestRessource>): HttpResponse<IRessource> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestRessource[]>): HttpResponse<IRessource[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
