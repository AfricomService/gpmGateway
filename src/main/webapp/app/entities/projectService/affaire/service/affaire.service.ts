import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAffaire, NewAffaire } from '../affaire.model';

export type PartialUpdateAffaire = Partial<IAffaire> & Pick<IAffaire, 'id'>;

type RestOf<T extends IAffaire | NewAffaire> = Omit<T, 'dateDebut' | 'dateCloture' | 'datePassageExecution' | 'createdAt' | 'updatedAt'> & {
  dateDebut?: string | null;
  dateCloture?: string | null;
  datePassageExecution?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestAffaire = RestOf<IAffaire>;

export type NewRestAffaire = RestOf<NewAffaire>;

export type PartialUpdateRestAffaire = RestOf<PartialUpdateAffaire>;

export type EntityResponseType = HttpResponse<IAffaire>;
export type EntityArrayResponseType = HttpResponse<IAffaire[]>;

@Injectable({ providedIn: 'root' })
export class AffaireService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/affaires', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(affaire: NewAffaire): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(affaire);
    return this.http
      .post<RestAffaire>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(affaire: IAffaire): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(affaire);
    return this.http
      .put<RestAffaire>(`${this.resourceUrl}/${this.getAffaireIdentifier(affaire)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(affaire: PartialUpdateAffaire): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(affaire);
    return this.http
      .patch<RestAffaire>(`${this.resourceUrl}/${this.getAffaireIdentifier(affaire)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestAffaire>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAffaire[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getAffaireIdentifier(affaire: Pick<IAffaire, 'id'>): number {
    return affaire.id;
  }

  compareAffaire(o1: Pick<IAffaire, 'id'> | null, o2: Pick<IAffaire, 'id'> | null): boolean {
    return o1 && o2 ? this.getAffaireIdentifier(o1) === this.getAffaireIdentifier(o2) : o1 === o2;
  }

  addAffaireToCollectionIfMissing<Type extends Pick<IAffaire, 'id'>>(
    affaireCollection: Type[],
    ...affairesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const affaires: Type[] = affairesToCheck.filter(isPresent);
    if (affaires.length > 0) {
      const affaireCollectionIdentifiers = affaireCollection.map(affaireItem => this.getAffaireIdentifier(affaireItem)!);
      const affairesToAdd = affaires.filter(affaireItem => {
        const affaireIdentifier = this.getAffaireIdentifier(affaireItem);
        if (affaireCollectionIdentifiers.includes(affaireIdentifier)) {
          return false;
        }
        affaireCollectionIdentifiers.push(affaireIdentifier);
        return true;
      });
      return [...affairesToAdd, ...affaireCollection];
    }
    return affaireCollection;
  }

  protected convertDateFromClient<T extends IAffaire | NewAffaire | PartialUpdateAffaire>(affaire: T): RestOf<T> {
    return {
      ...affaire,
      dateDebut: affaire.dateDebut?.format(DATE_FORMAT) ?? null,
      dateCloture: affaire.dateCloture?.format(DATE_FORMAT) ?? null,
      datePassageExecution: affaire.datePassageExecution?.format(DATE_FORMAT) ?? null,
      createdAt: affaire.createdAt?.toJSON() ?? null,
      updatedAt: affaire.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restAffaire: RestAffaire): IAffaire {
    return {
      ...restAffaire,
      dateDebut: restAffaire.dateDebut ? dayjs(restAffaire.dateDebut) : undefined,
      dateCloture: restAffaire.dateCloture ? dayjs(restAffaire.dateCloture) : undefined,
      datePassageExecution: restAffaire.datePassageExecution ? dayjs(restAffaire.datePassageExecution) : undefined,
      createdAt: restAffaire.createdAt ? dayjs(restAffaire.createdAt) : undefined,
      updatedAt: restAffaire.updatedAt ? dayjs(restAffaire.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestAffaire>): HttpResponse<IAffaire> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAffaire[]>): HttpResponse<IAffaire[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
