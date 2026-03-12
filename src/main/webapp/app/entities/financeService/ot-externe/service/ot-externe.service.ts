import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IOtExterne, NewOtExterne } from '../ot-externe.model';

export type PartialUpdateOtExterne = Partial<IOtExterne> & Pick<IOtExterne, 'id'>;

type RestOf<T extends IOtExterne | NewOtExterne> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestOtExterne = RestOf<IOtExterne>;

export type NewRestOtExterne = RestOf<NewOtExterne>;

export type PartialUpdateRestOtExterne = RestOf<PartialUpdateOtExterne>;

export type EntityResponseType = HttpResponse<IOtExterne>;
export type EntityArrayResponseType = HttpResponse<IOtExterne[]>;

@Injectable({ providedIn: 'root' })
export class OtExterneService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/ot-externes', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(otExterne: NewOtExterne): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(otExterne);
    return this.http
      .post<RestOtExterne>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(otExterne: IOtExterne): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(otExterne);
    return this.http
      .put<RestOtExterne>(`${this.resourceUrl}/${this.getOtExterneIdentifier(otExterne)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(otExterne: PartialUpdateOtExterne): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(otExterne);
    return this.http
      .patch<RestOtExterne>(`${this.resourceUrl}/${this.getOtExterneIdentifier(otExterne)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestOtExterne>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOtExterne[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getOtExterneIdentifier(otExterne: Pick<IOtExterne, 'id'>): number {
    return otExterne.id;
  }

  compareOtExterne(o1: Pick<IOtExterne, 'id'> | null, o2: Pick<IOtExterne, 'id'> | null): boolean {
    return o1 && o2 ? this.getOtExterneIdentifier(o1) === this.getOtExterneIdentifier(o2) : o1 === o2;
  }

  addOtExterneToCollectionIfMissing<Type extends Pick<IOtExterne, 'id'>>(
    otExterneCollection: Type[],
    ...otExternesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const otExternes: Type[] = otExternesToCheck.filter(isPresent);
    if (otExternes.length > 0) {
      const otExterneCollectionIdentifiers = otExterneCollection.map(otExterneItem => this.getOtExterneIdentifier(otExterneItem)!);
      const otExternesToAdd = otExternes.filter(otExterneItem => {
        const otExterneIdentifier = this.getOtExterneIdentifier(otExterneItem);
        if (otExterneCollectionIdentifiers.includes(otExterneIdentifier)) {
          return false;
        }
        otExterneCollectionIdentifiers.push(otExterneIdentifier);
        return true;
      });
      return [...otExternesToAdd, ...otExterneCollection];
    }
    return otExterneCollection;
  }

  protected convertDateFromClient<T extends IOtExterne | NewOtExterne | PartialUpdateOtExterne>(otExterne: T): RestOf<T> {
    return {
      ...otExterne,
      createdAt: otExterne.createdAt?.toJSON() ?? null,
      updatedAt: otExterne.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restOtExterne: RestOtExterne): IOtExterne {
    return {
      ...restOtExterne,
      createdAt: restOtExterne.createdAt ? dayjs(restOtExterne.createdAt) : undefined,
      updatedAt: restOtExterne.updatedAt ? dayjs(restOtExterne.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestOtExterne>): HttpResponse<IOtExterne> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestOtExterne[]>): HttpResponse<IOtExterne[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
