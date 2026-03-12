import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IMotif, NewMotif } from '../motif.model';

export type PartialUpdateMotif = Partial<IMotif> & Pick<IMotif, 'id'>;

type RestOf<T extends IMotif | NewMotif> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestMotif = RestOf<IMotif>;

export type NewRestMotif = RestOf<NewMotif>;

export type PartialUpdateRestMotif = RestOf<PartialUpdateMotif>;

export type EntityResponseType = HttpResponse<IMotif>;
export type EntityArrayResponseType = HttpResponse<IMotif[]>;

@Injectable({ providedIn: 'root' })
export class MotifService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/motifs', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(motif: NewMotif): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(motif);
    return this.http.post<RestMotif>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(motif: IMotif): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(motif);
    return this.http
      .put<RestMotif>(`${this.resourceUrl}/${this.getMotifIdentifier(motif)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(motif: PartialUpdateMotif): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(motif);
    return this.http
      .patch<RestMotif>(`${this.resourceUrl}/${this.getMotifIdentifier(motif)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestMotif>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestMotif[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getMotifIdentifier(motif: Pick<IMotif, 'id'>): number {
    return motif.id;
  }

  compareMotif(o1: Pick<IMotif, 'id'> | null, o2: Pick<IMotif, 'id'> | null): boolean {
    return o1 && o2 ? this.getMotifIdentifier(o1) === this.getMotifIdentifier(o2) : o1 === o2;
  }

  addMotifToCollectionIfMissing<Type extends Pick<IMotif, 'id'>>(
    motifCollection: Type[],
    ...motifsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const motifs: Type[] = motifsToCheck.filter(isPresent);
    if (motifs.length > 0) {
      const motifCollectionIdentifiers = motifCollection.map(motifItem => this.getMotifIdentifier(motifItem)!);
      const motifsToAdd = motifs.filter(motifItem => {
        const motifIdentifier = this.getMotifIdentifier(motifItem);
        if (motifCollectionIdentifiers.includes(motifIdentifier)) {
          return false;
        }
        motifCollectionIdentifiers.push(motifIdentifier);
        return true;
      });
      return [...motifsToAdd, ...motifCollection];
    }
    return motifCollection;
  }

  protected convertDateFromClient<T extends IMotif | NewMotif | PartialUpdateMotif>(motif: T): RestOf<T> {
    return {
      ...motif,
      createdAt: motif.createdAt?.toJSON() ?? null,
      updatedAt: motif.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restMotif: RestMotif): IMotif {
    return {
      ...restMotif,
      createdAt: restMotif.createdAt ? dayjs(restMotif.createdAt) : undefined,
      updatedAt: restMotif.updatedAt ? dayjs(restMotif.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestMotif>): HttpResponse<IMotif> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestMotif[]>): HttpResponse<IMotif[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
