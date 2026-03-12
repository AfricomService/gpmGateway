import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISociete, NewSociete } from '../societe.model';

export type PartialUpdateSociete = Partial<ISociete> & Pick<ISociete, 'id'>;

type RestOf<T extends ISociete | NewSociete> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestSociete = RestOf<ISociete>;

export type NewRestSociete = RestOf<NewSociete>;

export type PartialUpdateRestSociete = RestOf<PartialUpdateSociete>;

export type EntityResponseType = HttpResponse<ISociete>;
export type EntityArrayResponseType = HttpResponse<ISociete[]>;

@Injectable({ providedIn: 'root' })
export class SocieteService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/societes', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(societe: NewSociete): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(societe);
    return this.http
      .post<RestSociete>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(societe: ISociete): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(societe);
    return this.http
      .put<RestSociete>(`${this.resourceUrl}/${this.getSocieteIdentifier(societe)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(societe: PartialUpdateSociete): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(societe);
    return this.http
      .patch<RestSociete>(`${this.resourceUrl}/${this.getSocieteIdentifier(societe)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestSociete>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSociete[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSocieteIdentifier(societe: Pick<ISociete, 'id'>): number {
    return societe.id;
  }

  compareSociete(o1: Pick<ISociete, 'id'> | null, o2: Pick<ISociete, 'id'> | null): boolean {
    return o1 && o2 ? this.getSocieteIdentifier(o1) === this.getSocieteIdentifier(o2) : o1 === o2;
  }

  addSocieteToCollectionIfMissing<Type extends Pick<ISociete, 'id'>>(
    societeCollection: Type[],
    ...societesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const societes: Type[] = societesToCheck.filter(isPresent);
    if (societes.length > 0) {
      const societeCollectionIdentifiers = societeCollection.map(societeItem => this.getSocieteIdentifier(societeItem)!);
      const societesToAdd = societes.filter(societeItem => {
        const societeIdentifier = this.getSocieteIdentifier(societeItem);
        if (societeCollectionIdentifiers.includes(societeIdentifier)) {
          return false;
        }
        societeCollectionIdentifiers.push(societeIdentifier);
        return true;
      });
      return [...societesToAdd, ...societeCollection];
    }
    return societeCollection;
  }

  protected convertDateFromClient<T extends ISociete | NewSociete | PartialUpdateSociete>(societe: T): RestOf<T> {
    return {
      ...societe,
      createdAt: societe.createdAt?.toJSON() ?? null,
      updatedAt: societe.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restSociete: RestSociete): ISociete {
    return {
      ...restSociete,
      createdAt: restSociete.createdAt ? dayjs(restSociete.createdAt) : undefined,
      updatedAt: restSociete.updatedAt ? dayjs(restSociete.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestSociete>): HttpResponse<ISociete> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestSociete[]>): HttpResponse<ISociete[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
