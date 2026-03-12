import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IJourFerie, NewJourFerie } from '../jour-ferie.model';

export type PartialUpdateJourFerie = Partial<IJourFerie> & Pick<IJourFerie, 'id'>;

type RestOf<T extends IJourFerie | NewJourFerie> = Omit<T, 'date'> & {
  date?: string | null;
};

export type RestJourFerie = RestOf<IJourFerie>;

export type NewRestJourFerie = RestOf<NewJourFerie>;

export type PartialUpdateRestJourFerie = RestOf<PartialUpdateJourFerie>;

export type EntityResponseType = HttpResponse<IJourFerie>;
export type EntityArrayResponseType = HttpResponse<IJourFerie[]>;

@Injectable({ providedIn: 'root' })
export class JourFerieService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/jour-feries', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(jourFerie: NewJourFerie): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(jourFerie);
    return this.http
      .post<RestJourFerie>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(jourFerie: IJourFerie): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(jourFerie);
    return this.http
      .put<RestJourFerie>(`${this.resourceUrl}/${this.getJourFerieIdentifier(jourFerie)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(jourFerie: PartialUpdateJourFerie): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(jourFerie);
    return this.http
      .patch<RestJourFerie>(`${this.resourceUrl}/${this.getJourFerieIdentifier(jourFerie)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestJourFerie>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestJourFerie[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getJourFerieIdentifier(jourFerie: Pick<IJourFerie, 'id'>): number {
    return jourFerie.id;
  }

  compareJourFerie(o1: Pick<IJourFerie, 'id'> | null, o2: Pick<IJourFerie, 'id'> | null): boolean {
    return o1 && o2 ? this.getJourFerieIdentifier(o1) === this.getJourFerieIdentifier(o2) : o1 === o2;
  }

  addJourFerieToCollectionIfMissing<Type extends Pick<IJourFerie, 'id'>>(
    jourFerieCollection: Type[],
    ...jourFeriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const jourFeries: Type[] = jourFeriesToCheck.filter(isPresent);
    if (jourFeries.length > 0) {
      const jourFerieCollectionIdentifiers = jourFerieCollection.map(jourFerieItem => this.getJourFerieIdentifier(jourFerieItem)!);
      const jourFeriesToAdd = jourFeries.filter(jourFerieItem => {
        const jourFerieIdentifier = this.getJourFerieIdentifier(jourFerieItem);
        if (jourFerieCollectionIdentifiers.includes(jourFerieIdentifier)) {
          return false;
        }
        jourFerieCollectionIdentifiers.push(jourFerieIdentifier);
        return true;
      });
      return [...jourFeriesToAdd, ...jourFerieCollection];
    }
    return jourFerieCollection;
  }

  protected convertDateFromClient<T extends IJourFerie | NewJourFerie | PartialUpdateJourFerie>(jourFerie: T): RestOf<T> {
    return {
      ...jourFerie,
      date: jourFerie.date?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restJourFerie: RestJourFerie): IJourFerie {
    return {
      ...restJourFerie,
      date: restJourFerie.date ? dayjs(restJourFerie.date) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestJourFerie>): HttpResponse<IJourFerie> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestJourFerie[]>): HttpResponse<IJourFerie[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
