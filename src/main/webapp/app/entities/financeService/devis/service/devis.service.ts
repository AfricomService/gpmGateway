import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDevis, NewDevis } from '../devis.model';

export type PartialUpdateDevis = Partial<IDevis> & Pick<IDevis, 'id'>;

type RestOf<T extends IDevis | NewDevis> = Omit<T, 'date' | 'createdAt' | 'updatedAt'> & {
  date?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestDevis = RestOf<IDevis>;

export type NewRestDevis = RestOf<NewDevis>;

export type PartialUpdateRestDevis = RestOf<PartialUpdateDevis>;

export type EntityResponseType = HttpResponse<IDevis>;
export type EntityArrayResponseType = HttpResponse<IDevis[]>;

@Injectable({ providedIn: 'root' })
export class DevisService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/devis', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(devis: NewDevis): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(devis);
    return this.http.post<RestDevis>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(devis: IDevis): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(devis);
    return this.http
      .put<RestDevis>(`${this.resourceUrl}/${this.getDevisIdentifier(devis)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(devis: PartialUpdateDevis): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(devis);
    return this.http
      .patch<RestDevis>(`${this.resourceUrl}/${this.getDevisIdentifier(devis)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestDevis>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestDevis[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDevisIdentifier(devis: Pick<IDevis, 'id'>): number {
    return devis.id;
  }

  compareDevis(o1: Pick<IDevis, 'id'> | null, o2: Pick<IDevis, 'id'> | null): boolean {
    return o1 && o2 ? this.getDevisIdentifier(o1) === this.getDevisIdentifier(o2) : o1 === o2;
  }

  addDevisToCollectionIfMissing<Type extends Pick<IDevis, 'id'>>(
    devisCollection: Type[],
    ...devisToCheck: (Type | null | undefined)[]
  ): Type[] {
    const devis: Type[] = devisToCheck.filter(isPresent);
    if (devis.length > 0) {
      const devisCollectionIdentifiers = devisCollection.map(devisItem => this.getDevisIdentifier(devisItem)!);
      const devisToAdd = devis.filter(devisItem => {
        const devisIdentifier = this.getDevisIdentifier(devisItem);
        if (devisCollectionIdentifiers.includes(devisIdentifier)) {
          return false;
        }
        devisCollectionIdentifiers.push(devisIdentifier);
        return true;
      });
      return [...devisToAdd, ...devisCollection];
    }
    return devisCollection;
  }

  protected convertDateFromClient<T extends IDevis | NewDevis | PartialUpdateDevis>(devis: T): RestOf<T> {
    return {
      ...devis,
      date: devis.date?.format(DATE_FORMAT) ?? null,
      createdAt: devis.createdAt?.toJSON() ?? null,
      updatedAt: devis.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restDevis: RestDevis): IDevis {
    return {
      ...restDevis,
      date: restDevis.date ? dayjs(restDevis.date) : undefined,
      createdAt: restDevis.createdAt ? dayjs(restDevis.createdAt) : undefined,
      updatedAt: restDevis.updatedAt ? dayjs(restDevis.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestDevis>): HttpResponse<IDevis> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestDevis[]>): HttpResponse<IDevis[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
