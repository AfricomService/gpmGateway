import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPhaseOt, NewPhaseOt } from '../phase-ot.model';

export type PartialUpdatePhaseOt = Partial<IPhaseOt> & Pick<IPhaseOt, 'id'>;

type RestOf<T extends IPhaseOt | NewPhaseOt> = Omit<T, 'dateDebut' | 'dl' | 'dlc'> & {
  dateDebut?: string | null;
  dl?: string | null;
  dlc?: string | null;
};

export type RestPhaseOt = RestOf<IPhaseOt>;

export type NewRestPhaseOt = RestOf<NewPhaseOt>;

export type PartialUpdateRestPhaseOt = RestOf<PartialUpdatePhaseOt>;

export type EntityResponseType = HttpResponse<IPhaseOt>;
export type EntityArrayResponseType = HttpResponse<IPhaseOt[]>;

@Injectable({ providedIn: 'root' })
export class PhaseOtService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/phase-ots', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(phaseOt: NewPhaseOt): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(phaseOt);
    return this.http
      .post<RestPhaseOt>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(phaseOt: IPhaseOt): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(phaseOt);
    return this.http
      .put<RestPhaseOt>(`${this.resourceUrl}/${this.getPhaseOtIdentifier(phaseOt)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(phaseOt: PartialUpdatePhaseOt): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(phaseOt);
    return this.http
      .patch<RestPhaseOt>(`${this.resourceUrl}/${this.getPhaseOtIdentifier(phaseOt)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPhaseOt>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPhaseOt[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPhaseOtIdentifier(phaseOt: Pick<IPhaseOt, 'id'>): number {
    return phaseOt.id;
  }

  comparePhaseOt(o1: Pick<IPhaseOt, 'id'> | null, o2: Pick<IPhaseOt, 'id'> | null): boolean {
    return o1 && o2 ? this.getPhaseOtIdentifier(o1) === this.getPhaseOtIdentifier(o2) : o1 === o2;
  }

  addPhaseOtToCollectionIfMissing<Type extends Pick<IPhaseOt, 'id'>>(
    phaseOtCollection: Type[],
    ...phaseOtsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const phaseOts: Type[] = phaseOtsToCheck.filter(isPresent);
    if (phaseOts.length > 0) {
      const phaseOtCollectionIdentifiers = phaseOtCollection.map(phaseOtItem => this.getPhaseOtIdentifier(phaseOtItem)!);
      const phaseOtsToAdd = phaseOts.filter(phaseOtItem => {
        const phaseOtIdentifier = this.getPhaseOtIdentifier(phaseOtItem);
        if (phaseOtCollectionIdentifiers.includes(phaseOtIdentifier)) {
          return false;
        }
        phaseOtCollectionIdentifiers.push(phaseOtIdentifier);
        return true;
      });
      return [...phaseOtsToAdd, ...phaseOtCollection];
    }
    return phaseOtCollection;
  }

  updateStatut(phaseOtId: number, statut: string): Observable<EntityResponseType> {
    return this.http
      .patch<RestPhaseOt>(`${this.resourceUrl}/${phaseOtId}/statut`, null, { params: { statut }, observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  isParent(phaseOtId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.resourceUrl}/${phaseOtId}/is-parent`);
  }

  protected convertDateFromClient<T extends IPhaseOt | NewPhaseOt | PartialUpdatePhaseOt>(phaseOt: T): RestOf<T> {
    return {
      ...phaseOt,
      dateDebut: phaseOt.dateDebut?.toJSON() ?? null,
      dl: phaseOt.dl?.toJSON() ?? null,
      dlc: phaseOt.dlc?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restPhaseOt: RestPhaseOt): IPhaseOt {
    return {
      ...restPhaseOt,
      dateDebut: restPhaseOt.dateDebut ? dayjs(restPhaseOt.dateDebut) : undefined,
      dl: restPhaseOt.dl ? dayjs(restPhaseOt.dl) : undefined,
      dlc: restPhaseOt.dlc ? dayjs(restPhaseOt.dlc) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPhaseOt>): HttpResponse<IPhaseOt> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPhaseOt[]>): HttpResponse<IPhaseOt[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
