import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IHistoriqueStatutWO, NewHistoriqueStatutWO } from '../historique-statut-wo.model';

export type PartialUpdateHistoriqueStatutWO = Partial<IHistoriqueStatutWO> & Pick<IHistoriqueStatutWO, 'id'>;

type RestOf<T extends IHistoriqueStatutWO | NewHistoriqueStatutWO> = Omit<T, 'dateChangement'> & {
  dateChangement?: string | null;
};

export type RestHistoriqueStatutWO = RestOf<IHistoriqueStatutWO>;

export type NewRestHistoriqueStatutWO = RestOf<NewHistoriqueStatutWO>;

export type PartialUpdateRestHistoriqueStatutWO = RestOf<PartialUpdateHistoriqueStatutWO>;

export type EntityResponseType = HttpResponse<IHistoriqueStatutWO>;
export type EntityArrayResponseType = HttpResponse<IHistoriqueStatutWO[]>;

@Injectable({ providedIn: 'root' })
export class HistoriqueStatutWOService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/historique-statut-wos', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(historiqueStatutWO: NewHistoriqueStatutWO): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(historiqueStatutWO);
    return this.http
      .post<RestHistoriqueStatutWO>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(historiqueStatutWO: IHistoriqueStatutWO): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(historiqueStatutWO);
    return this.http
      .put<RestHistoriqueStatutWO>(`${this.resourceUrl}/${this.getHistoriqueStatutWOIdentifier(historiqueStatutWO)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(historiqueStatutWO: PartialUpdateHistoriqueStatutWO): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(historiqueStatutWO);
    return this.http
      .patch<RestHistoriqueStatutWO>(`${this.resourceUrl}/${this.getHistoriqueStatutWOIdentifier(historiqueStatutWO)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestHistoriqueStatutWO>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestHistoriqueStatutWO[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getHistoriqueStatutWOIdentifier(historiqueStatutWO: Pick<IHistoriqueStatutWO, 'id'>): number {
    return historiqueStatutWO.id;
  }

  compareHistoriqueStatutWO(o1: Pick<IHistoriqueStatutWO, 'id'> | null, o2: Pick<IHistoriqueStatutWO, 'id'> | null): boolean {
    return o1 && o2 ? this.getHistoriqueStatutWOIdentifier(o1) === this.getHistoriqueStatutWOIdentifier(o2) : o1 === o2;
  }

  addHistoriqueStatutWOToCollectionIfMissing<Type extends Pick<IHistoriqueStatutWO, 'id'>>(
    historiqueStatutWOCollection: Type[],
    ...historiqueStatutWOSToCheck: (Type | null | undefined)[]
  ): Type[] {
    const historiqueStatutWOS: Type[] = historiqueStatutWOSToCheck.filter(isPresent);
    if (historiqueStatutWOS.length > 0) {
      const historiqueStatutWOCollectionIdentifiers = historiqueStatutWOCollection.map(
        historiqueStatutWOItem => this.getHistoriqueStatutWOIdentifier(historiqueStatutWOItem)!
      );
      const historiqueStatutWOSToAdd = historiqueStatutWOS.filter(historiqueStatutWOItem => {
        const historiqueStatutWOIdentifier = this.getHistoriqueStatutWOIdentifier(historiqueStatutWOItem);
        if (historiqueStatutWOCollectionIdentifiers.includes(historiqueStatutWOIdentifier)) {
          return false;
        }
        historiqueStatutWOCollectionIdentifiers.push(historiqueStatutWOIdentifier);
        return true;
      });
      return [...historiqueStatutWOSToAdd, ...historiqueStatutWOCollection];
    }
    return historiqueStatutWOCollection;
  }

  protected convertDateFromClient<T extends IHistoriqueStatutWO | NewHistoriqueStatutWO | PartialUpdateHistoriqueStatutWO>(
    historiqueStatutWO: T
  ): RestOf<T> {
    return {
      ...historiqueStatutWO,
      dateChangement: historiqueStatutWO.dateChangement?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restHistoriqueStatutWO: RestHistoriqueStatutWO): IHistoriqueStatutWO {
    return {
      ...restHistoriqueStatutWO,
      dateChangement: restHistoriqueStatutWO.dateChangement ? dayjs(restHistoriqueStatutWO.dateChangement) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestHistoriqueStatutWO>): HttpResponse<IHistoriqueStatutWO> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestHistoriqueStatutWO[]>): HttpResponse<IHistoriqueStatutWO[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
