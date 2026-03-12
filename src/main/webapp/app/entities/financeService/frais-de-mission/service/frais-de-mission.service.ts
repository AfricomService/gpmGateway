import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFraisDeMission, NewFraisDeMission } from '../frais-de-mission.model';

export type PartialUpdateFraisDeMission = Partial<IFraisDeMission> & Pick<IFraisDeMission, 'id'>;

type RestOf<T extends IFraisDeMission | NewFraisDeMission> = Omit<T, 'dateDebut' | 'dateFin' | 'createdAt' | 'updatedAt'> & {
  dateDebut?: string | null;
  dateFin?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestFraisDeMission = RestOf<IFraisDeMission>;

export type NewRestFraisDeMission = RestOf<NewFraisDeMission>;

export type PartialUpdateRestFraisDeMission = RestOf<PartialUpdateFraisDeMission>;

export type EntityResponseType = HttpResponse<IFraisDeMission>;
export type EntityArrayResponseType = HttpResponse<IFraisDeMission[]>;

@Injectable({ providedIn: 'root' })
export class FraisDeMissionService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/frais-de-missions', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(fraisDeMission: NewFraisDeMission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(fraisDeMission);
    return this.http
      .post<RestFraisDeMission>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(fraisDeMission: IFraisDeMission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(fraisDeMission);
    return this.http
      .put<RestFraisDeMission>(`${this.resourceUrl}/${this.getFraisDeMissionIdentifier(fraisDeMission)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(fraisDeMission: PartialUpdateFraisDeMission): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(fraisDeMission);
    return this.http
      .patch<RestFraisDeMission>(`${this.resourceUrl}/${this.getFraisDeMissionIdentifier(fraisDeMission)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestFraisDeMission>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestFraisDeMission[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getFraisDeMissionIdentifier(fraisDeMission: Pick<IFraisDeMission, 'id'>): number {
    return fraisDeMission.id;
  }

  compareFraisDeMission(o1: Pick<IFraisDeMission, 'id'> | null, o2: Pick<IFraisDeMission, 'id'> | null): boolean {
    return o1 && o2 ? this.getFraisDeMissionIdentifier(o1) === this.getFraisDeMissionIdentifier(o2) : o1 === o2;
  }

  addFraisDeMissionToCollectionIfMissing<Type extends Pick<IFraisDeMission, 'id'>>(
    fraisDeMissionCollection: Type[],
    ...fraisDeMissionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const fraisDeMissions: Type[] = fraisDeMissionsToCheck.filter(isPresent);
    if (fraisDeMissions.length > 0) {
      const fraisDeMissionCollectionIdentifiers = fraisDeMissionCollection.map(
        fraisDeMissionItem => this.getFraisDeMissionIdentifier(fraisDeMissionItem)!
      );
      const fraisDeMissionsToAdd = fraisDeMissions.filter(fraisDeMissionItem => {
        const fraisDeMissionIdentifier = this.getFraisDeMissionIdentifier(fraisDeMissionItem);
        if (fraisDeMissionCollectionIdentifiers.includes(fraisDeMissionIdentifier)) {
          return false;
        }
        fraisDeMissionCollectionIdentifiers.push(fraisDeMissionIdentifier);
        return true;
      });
      return [...fraisDeMissionsToAdd, ...fraisDeMissionCollection];
    }
    return fraisDeMissionCollection;
  }

  protected convertDateFromClient<T extends IFraisDeMission | NewFraisDeMission | PartialUpdateFraisDeMission>(
    fraisDeMission: T
  ): RestOf<T> {
    return {
      ...fraisDeMission,
      dateDebut: fraisDeMission.dateDebut?.format(DATE_FORMAT) ?? null,
      dateFin: fraisDeMission.dateFin?.format(DATE_FORMAT) ?? null,
      createdAt: fraisDeMission.createdAt?.toJSON() ?? null,
      updatedAt: fraisDeMission.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restFraisDeMission: RestFraisDeMission): IFraisDeMission {
    return {
      ...restFraisDeMission,
      dateDebut: restFraisDeMission.dateDebut ? dayjs(restFraisDeMission.dateDebut) : undefined,
      dateFin: restFraisDeMission.dateFin ? dayjs(restFraisDeMission.dateFin) : undefined,
      createdAt: restFraisDeMission.createdAt ? dayjs(restFraisDeMission.createdAt) : undefined,
      updatedAt: restFraisDeMission.updatedAt ? dayjs(restFraisDeMission.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestFraisDeMission>): HttpResponse<IFraisDeMission> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestFraisDeMission[]>): HttpResponse<IFraisDeMission[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
