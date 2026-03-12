import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDemandeAchat, NewDemandeAchat } from '../demande-achat.model';

export type PartialUpdateDemandeAchat = Partial<IDemandeAchat> & Pick<IDemandeAchat, 'id'>;

type RestOf<T extends IDemandeAchat | NewDemandeAchat> = Omit<T, 'dateCreation' | 'dateMiseADisposition' | 'createdAt' | 'updatedAt'> & {
  dateCreation?: string | null;
  dateMiseADisposition?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestDemandeAchat = RestOf<IDemandeAchat>;

export type NewRestDemandeAchat = RestOf<NewDemandeAchat>;

export type PartialUpdateRestDemandeAchat = RestOf<PartialUpdateDemandeAchat>;

export type EntityResponseType = HttpResponse<IDemandeAchat>;
export type EntityArrayResponseType = HttpResponse<IDemandeAchat[]>;

@Injectable({ providedIn: 'root' })
export class DemandeAchatService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/demande-achats', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(demandeAchat: NewDemandeAchat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(demandeAchat);
    return this.http
      .post<RestDemandeAchat>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(demandeAchat: IDemandeAchat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(demandeAchat);
    return this.http
      .put<RestDemandeAchat>(`${this.resourceUrl}/${this.getDemandeAchatIdentifier(demandeAchat)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(demandeAchat: PartialUpdateDemandeAchat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(demandeAchat);
    return this.http
      .patch<RestDemandeAchat>(`${this.resourceUrl}/${this.getDemandeAchatIdentifier(demandeAchat)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestDemandeAchat>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestDemandeAchat[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDemandeAchatIdentifier(demandeAchat: Pick<IDemandeAchat, 'id'>): number {
    return demandeAchat.id;
  }

  compareDemandeAchat(o1: Pick<IDemandeAchat, 'id'> | null, o2: Pick<IDemandeAchat, 'id'> | null): boolean {
    return o1 && o2 ? this.getDemandeAchatIdentifier(o1) === this.getDemandeAchatIdentifier(o2) : o1 === o2;
  }

  addDemandeAchatToCollectionIfMissing<Type extends Pick<IDemandeAchat, 'id'>>(
    demandeAchatCollection: Type[],
    ...demandeAchatsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const demandeAchats: Type[] = demandeAchatsToCheck.filter(isPresent);
    if (demandeAchats.length > 0) {
      const demandeAchatCollectionIdentifiers = demandeAchatCollection.map(
        demandeAchatItem => this.getDemandeAchatIdentifier(demandeAchatItem)!
      );
      const demandeAchatsToAdd = demandeAchats.filter(demandeAchatItem => {
        const demandeAchatIdentifier = this.getDemandeAchatIdentifier(demandeAchatItem);
        if (demandeAchatCollectionIdentifiers.includes(demandeAchatIdentifier)) {
          return false;
        }
        demandeAchatCollectionIdentifiers.push(demandeAchatIdentifier);
        return true;
      });
      return [...demandeAchatsToAdd, ...demandeAchatCollection];
    }
    return demandeAchatCollection;
  }

  protected convertDateFromClient<T extends IDemandeAchat | NewDemandeAchat | PartialUpdateDemandeAchat>(demandeAchat: T): RestOf<T> {
    return {
      ...demandeAchat,
      dateCreation: demandeAchat.dateCreation?.toJSON() ?? null,
      dateMiseADisposition: demandeAchat.dateMiseADisposition?.format(DATE_FORMAT) ?? null,
      createdAt: demandeAchat.createdAt?.toJSON() ?? null,
      updatedAt: demandeAchat.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restDemandeAchat: RestDemandeAchat): IDemandeAchat {
    return {
      ...restDemandeAchat,
      dateCreation: restDemandeAchat.dateCreation ? dayjs(restDemandeAchat.dateCreation) : undefined,
      dateMiseADisposition: restDemandeAchat.dateMiseADisposition ? dayjs(restDemandeAchat.dateMiseADisposition) : undefined,
      createdAt: restDemandeAchat.createdAt ? dayjs(restDemandeAchat.createdAt) : undefined,
      updatedAt: restDemandeAchat.updatedAt ? dayjs(restDemandeAchat.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestDemandeAchat>): HttpResponse<IDemandeAchat> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestDemandeAchat[]>): HttpResponse<IDemandeAchat[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
