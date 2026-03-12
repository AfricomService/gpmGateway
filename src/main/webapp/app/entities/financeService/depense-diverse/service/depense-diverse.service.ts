import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDepenseDiverse, NewDepenseDiverse } from '../depense-diverse.model';

export type PartialUpdateDepenseDiverse = Partial<IDepenseDiverse> & Pick<IDepenseDiverse, 'id'>;

type RestOf<T extends IDepenseDiverse | NewDepenseDiverse> = Omit<T, 'date' | 'createdAt' | 'updatedAt'> & {
  date?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestDepenseDiverse = RestOf<IDepenseDiverse>;

export type NewRestDepenseDiverse = RestOf<NewDepenseDiverse>;

export type PartialUpdateRestDepenseDiverse = RestOf<PartialUpdateDepenseDiverse>;

export type EntityResponseType = HttpResponse<IDepenseDiverse>;
export type EntityArrayResponseType = HttpResponse<IDepenseDiverse[]>;

@Injectable({ providedIn: 'root' })
export class DepenseDiverseService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/depense-diverses', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(depenseDiverse: NewDepenseDiverse): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(depenseDiverse);
    return this.http
      .post<RestDepenseDiverse>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(depenseDiverse: IDepenseDiverse): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(depenseDiverse);
    return this.http
      .put<RestDepenseDiverse>(`${this.resourceUrl}/${this.getDepenseDiverseIdentifier(depenseDiverse)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(depenseDiverse: PartialUpdateDepenseDiverse): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(depenseDiverse);
    return this.http
      .patch<RestDepenseDiverse>(`${this.resourceUrl}/${this.getDepenseDiverseIdentifier(depenseDiverse)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestDepenseDiverse>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestDepenseDiverse[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDepenseDiverseIdentifier(depenseDiverse: Pick<IDepenseDiverse, 'id'>): number {
    return depenseDiverse.id;
  }

  compareDepenseDiverse(o1: Pick<IDepenseDiverse, 'id'> | null, o2: Pick<IDepenseDiverse, 'id'> | null): boolean {
    return o1 && o2 ? this.getDepenseDiverseIdentifier(o1) === this.getDepenseDiverseIdentifier(o2) : o1 === o2;
  }

  addDepenseDiverseToCollectionIfMissing<Type extends Pick<IDepenseDiverse, 'id'>>(
    depenseDiverseCollection: Type[],
    ...depenseDiversesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const depenseDiverses: Type[] = depenseDiversesToCheck.filter(isPresent);
    if (depenseDiverses.length > 0) {
      const depenseDiverseCollectionIdentifiers = depenseDiverseCollection.map(
        depenseDiverseItem => this.getDepenseDiverseIdentifier(depenseDiverseItem)!
      );
      const depenseDiversesToAdd = depenseDiverses.filter(depenseDiverseItem => {
        const depenseDiverseIdentifier = this.getDepenseDiverseIdentifier(depenseDiverseItem);
        if (depenseDiverseCollectionIdentifiers.includes(depenseDiverseIdentifier)) {
          return false;
        }
        depenseDiverseCollectionIdentifiers.push(depenseDiverseIdentifier);
        return true;
      });
      return [...depenseDiversesToAdd, ...depenseDiverseCollection];
    }
    return depenseDiverseCollection;
  }

  protected convertDateFromClient<T extends IDepenseDiverse | NewDepenseDiverse | PartialUpdateDepenseDiverse>(
    depenseDiverse: T
  ): RestOf<T> {
    return {
      ...depenseDiverse,
      date: depenseDiverse.date?.format(DATE_FORMAT) ?? null,
      createdAt: depenseDiverse.createdAt?.toJSON() ?? null,
      updatedAt: depenseDiverse.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restDepenseDiverse: RestDepenseDiverse): IDepenseDiverse {
    return {
      ...restDepenseDiverse,
      date: restDepenseDiverse.date ? dayjs(restDepenseDiverse.date) : undefined,
      createdAt: restDepenseDiverse.createdAt ? dayjs(restDepenseDiverse.createdAt) : undefined,
      updatedAt: restDepenseDiverse.updatedAt ? dayjs(restDepenseDiverse.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestDepenseDiverse>): HttpResponse<IDepenseDiverse> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestDepenseDiverse[]>): HttpResponse<IDepenseDiverse[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
