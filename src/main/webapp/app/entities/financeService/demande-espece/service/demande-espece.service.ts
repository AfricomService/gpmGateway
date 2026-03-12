import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDemandeEspece, NewDemandeEspece } from '../demande-espece.model';

export type PartialUpdateDemandeEspece = Partial<IDemandeEspece> & Pick<IDemandeEspece, 'id'>;

type RestOf<T extends IDemandeEspece | NewDemandeEspece> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestDemandeEspece = RestOf<IDemandeEspece>;

export type NewRestDemandeEspece = RestOf<NewDemandeEspece>;

export type PartialUpdateRestDemandeEspece = RestOf<PartialUpdateDemandeEspece>;

export type EntityResponseType = HttpResponse<IDemandeEspece>;
export type EntityArrayResponseType = HttpResponse<IDemandeEspece[]>;

@Injectable({ providedIn: 'root' })
export class DemandeEspeceService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/demande-especes', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(demandeEspece: NewDemandeEspece): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(demandeEspece);
    return this.http
      .post<RestDemandeEspece>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(demandeEspece: IDemandeEspece): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(demandeEspece);
    return this.http
      .put<RestDemandeEspece>(`${this.resourceUrl}/${this.getDemandeEspeceIdentifier(demandeEspece)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(demandeEspece: PartialUpdateDemandeEspece): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(demandeEspece);
    return this.http
      .patch<RestDemandeEspece>(`${this.resourceUrl}/${this.getDemandeEspeceIdentifier(demandeEspece)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestDemandeEspece>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestDemandeEspece[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDemandeEspeceIdentifier(demandeEspece: Pick<IDemandeEspece, 'id'>): number {
    return demandeEspece.id;
  }

  compareDemandeEspece(o1: Pick<IDemandeEspece, 'id'> | null, o2: Pick<IDemandeEspece, 'id'> | null): boolean {
    return o1 && o2 ? this.getDemandeEspeceIdentifier(o1) === this.getDemandeEspeceIdentifier(o2) : o1 === o2;
  }

  addDemandeEspeceToCollectionIfMissing<Type extends Pick<IDemandeEspece, 'id'>>(
    demandeEspeceCollection: Type[],
    ...demandeEspecesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const demandeEspeces: Type[] = demandeEspecesToCheck.filter(isPresent);
    if (demandeEspeces.length > 0) {
      const demandeEspeceCollectionIdentifiers = demandeEspeceCollection.map(
        demandeEspeceItem => this.getDemandeEspeceIdentifier(demandeEspeceItem)!
      );
      const demandeEspecesToAdd = demandeEspeces.filter(demandeEspeceItem => {
        const demandeEspeceIdentifier = this.getDemandeEspeceIdentifier(demandeEspeceItem);
        if (demandeEspeceCollectionIdentifiers.includes(demandeEspeceIdentifier)) {
          return false;
        }
        demandeEspeceCollectionIdentifiers.push(demandeEspeceIdentifier);
        return true;
      });
      return [...demandeEspecesToAdd, ...demandeEspeceCollection];
    }
    return demandeEspeceCollection;
  }

  protected convertDateFromClient<T extends IDemandeEspece | NewDemandeEspece | PartialUpdateDemandeEspece>(demandeEspece: T): RestOf<T> {
    return {
      ...demandeEspece,
      createdAt: demandeEspece.createdAt?.toJSON() ?? null,
      updatedAt: demandeEspece.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restDemandeEspece: RestDemandeEspece): IDemandeEspece {
    return {
      ...restDemandeEspece,
      createdAt: restDemandeEspece.createdAt ? dayjs(restDemandeEspece.createdAt) : undefined,
      updatedAt: restDemandeEspece.updatedAt ? dayjs(restDemandeEspece.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestDemandeEspece>): HttpResponse<IDemandeEspece> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestDemandeEspece[]>): HttpResponse<IDemandeEspece[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
