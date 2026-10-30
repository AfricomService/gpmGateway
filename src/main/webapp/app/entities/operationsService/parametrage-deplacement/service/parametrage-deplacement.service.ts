import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IParametrageDeplacement, NewParametrageDeplacement } from '../parametrage-deplacement.model';

export type PartialUpdateParametrageDeplacement = Partial<IParametrageDeplacement> & Pick<IParametrageDeplacement, 'id'>;

type RestOf<T extends IParametrageDeplacement | NewParametrageDeplacement> = Omit<T, 'date'> & {
  date?: string | null;
};

export type RestParametrageDeplacement = RestOf<IParametrageDeplacement>;

export type NewRestParametrageDeplacement = RestOf<NewParametrageDeplacement>;

export type PartialUpdateRestParametrageDeplacement = RestOf<PartialUpdateParametrageDeplacement>;

export type EntityResponseType = HttpResponse<IParametrageDeplacement>;
export type EntityArrayResponseType = HttpResponse<IParametrageDeplacement[]>;

@Injectable({ providedIn: 'root' })
export class ParametrageDeplacementService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/parametrage-deplacements', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(parametrageDeplacement: NewParametrageDeplacement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(parametrageDeplacement);
    return this.http
      .post<RestParametrageDeplacement>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(parametrageDeplacement: IParametrageDeplacement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(parametrageDeplacement);
    return this.http
      .put<RestParametrageDeplacement>(`${this.resourceUrl}/${this.getParametrageDeplacementIdentifier(parametrageDeplacement)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(parametrageDeplacement: PartialUpdateParametrageDeplacement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(parametrageDeplacement);
    return this.http
      .patch<RestParametrageDeplacement>(`${this.resourceUrl}/${this.getParametrageDeplacementIdentifier(parametrageDeplacement)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestParametrageDeplacement>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestParametrageDeplacement[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getParametrageDeplacementIdentifier(parametrageDeplacement: Pick<IParametrageDeplacement, 'id'>): number {
    return parametrageDeplacement.id;
  }

  compareParametrageDeplacement(o1: Pick<IParametrageDeplacement, 'id'> | null, o2: Pick<IParametrageDeplacement, 'id'> | null): boolean {
    return o1 && o2 ? this.getParametrageDeplacementIdentifier(o1) === this.getParametrageDeplacementIdentifier(o2) : o1 === o2;
  }

  addParametrageDeplacementToCollectionIfMissing<Type extends Pick<IParametrageDeplacement, 'id'>>(
    parametrageDeplacementCollection: Type[],
    ...parametrageDeplacementsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const parametrageDeplacements: Type[] = parametrageDeplacementsToCheck.filter(isPresent);
    if (parametrageDeplacements.length > 0) {
      const parametrageDeplacementCollectionIdentifiers = parametrageDeplacementCollection.map(
        parametrageDeplacementItem => this.getParametrageDeplacementIdentifier(parametrageDeplacementItem)!
      );
      const parametrageDeplacementsToAdd = parametrageDeplacements.filter(parametrageDeplacementItem => {
        const parametrageDeplacementIdentifier = this.getParametrageDeplacementIdentifier(parametrageDeplacementItem);
        if (parametrageDeplacementCollectionIdentifiers.includes(parametrageDeplacementIdentifier)) {
          return false;
        }
        parametrageDeplacementCollectionIdentifiers.push(parametrageDeplacementIdentifier);
        return true;
      });
      return [...parametrageDeplacementsToAdd, ...parametrageDeplacementCollection];
    }
    return parametrageDeplacementCollection;
  }

  protected convertDateFromClient<T extends IParametrageDeplacement | NewParametrageDeplacement | PartialUpdateParametrageDeplacement>(
    parametrageDeplacement: T
  ): RestOf<T> {
    return {
      ...parametrageDeplacement,
      date: parametrageDeplacement.date?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restParametrageDeplacement: RestParametrageDeplacement): IParametrageDeplacement {
    return {
      ...restParametrageDeplacement,
      date: restParametrageDeplacement.date ? dayjs(restParametrageDeplacement.date) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestParametrageDeplacement>): HttpResponse<IParametrageDeplacement> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestParametrageDeplacement[]>): HttpResponse<IParametrageDeplacement[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
