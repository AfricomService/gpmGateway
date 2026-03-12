import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISST, NewSST } from '../sst.model';

export type PartialUpdateSST = Partial<ISST> & Pick<ISST, 'id'>;

type RestOf<T extends ISST | NewSST> = Omit<T, 'date' | 'createdAt' | 'updatedAt'> & {
  date?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestSST = RestOf<ISST>;

export type NewRestSST = RestOf<NewSST>;

export type PartialUpdateRestSST = RestOf<PartialUpdateSST>;

export type EntityResponseType = HttpResponse<ISST>;
export type EntityArrayResponseType = HttpResponse<ISST[]>;

@Injectable({ providedIn: 'root' })
export class SSTService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/ssts', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(sST: NewSST): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sST);
    return this.http.post<RestSST>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(sST: ISST): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sST);
    return this.http
      .put<RestSST>(`${this.resourceUrl}/${this.getSSTIdentifier(sST)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(sST: PartialUpdateSST): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sST);
    return this.http
      .patch<RestSST>(`${this.resourceUrl}/${this.getSSTIdentifier(sST)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestSST>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSST[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSSTIdentifier(sST: Pick<ISST, 'id'>): number {
    return sST.id;
  }

  compareSST(o1: Pick<ISST, 'id'> | null, o2: Pick<ISST, 'id'> | null): boolean {
    return o1 && o2 ? this.getSSTIdentifier(o1) === this.getSSTIdentifier(o2) : o1 === o2;
  }

  addSSTToCollectionIfMissing<Type extends Pick<ISST, 'id'>>(sSTCollection: Type[], ...sSTSToCheck: (Type | null | undefined)[]): Type[] {
    const sSTS: Type[] = sSTSToCheck.filter(isPresent);
    if (sSTS.length > 0) {
      const sSTCollectionIdentifiers = sSTCollection.map(sSTItem => this.getSSTIdentifier(sSTItem)!);
      const sSTSToAdd = sSTS.filter(sSTItem => {
        const sSTIdentifier = this.getSSTIdentifier(sSTItem);
        if (sSTCollectionIdentifiers.includes(sSTIdentifier)) {
          return false;
        }
        sSTCollectionIdentifiers.push(sSTIdentifier);
        return true;
      });
      return [...sSTSToAdd, ...sSTCollection];
    }
    return sSTCollection;
  }

  protected convertDateFromClient<T extends ISST | NewSST | PartialUpdateSST>(sST: T): RestOf<T> {
    return {
      ...sST,
      date: sST.date?.format(DATE_FORMAT) ?? null,
      createdAt: sST.createdAt?.toJSON() ?? null,
      updatedAt: sST.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restSST: RestSST): ISST {
    return {
      ...restSST,
      date: restSST.date ? dayjs(restSST.date) : undefined,
      createdAt: restSST.createdAt ? dayjs(restSST.createdAt) : undefined,
      updatedAt: restSST.updatedAt ? dayjs(restSST.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestSST>): HttpResponse<ISST> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestSST[]>): HttpResponse<ISST[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
