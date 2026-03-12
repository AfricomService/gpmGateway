import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPieceJointe, NewPieceJointe } from '../piece-jointe.model';

export type PartialUpdatePieceJointe = Partial<IPieceJointe> & Pick<IPieceJointe, 'id'>;

type RestOf<T extends IPieceJointe | NewPieceJointe> = Omit<T, 'dateUpload'> & {
  dateUpload?: string | null;
};

export type RestPieceJointe = RestOf<IPieceJointe>;

export type NewRestPieceJointe = RestOf<NewPieceJointe>;

export type PartialUpdateRestPieceJointe = RestOf<PartialUpdatePieceJointe>;

export type EntityResponseType = HttpResponse<IPieceJointe>;
export type EntityArrayResponseType = HttpResponse<IPieceJointe[]>;

@Injectable({ providedIn: 'root' })
export class PieceJointeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/piece-jointes', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(pieceJointe: NewPieceJointe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(pieceJointe);
    return this.http
      .post<RestPieceJointe>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(pieceJointe: IPieceJointe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(pieceJointe);
    return this.http
      .put<RestPieceJointe>(`${this.resourceUrl}/${this.getPieceJointeIdentifier(pieceJointe)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(pieceJointe: PartialUpdatePieceJointe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(pieceJointe);
    return this.http
      .patch<RestPieceJointe>(`${this.resourceUrl}/${this.getPieceJointeIdentifier(pieceJointe)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPieceJointe>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPieceJointe[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPieceJointeIdentifier(pieceJointe: Pick<IPieceJointe, 'id'>): number {
    return pieceJointe.id;
  }

  comparePieceJointe(o1: Pick<IPieceJointe, 'id'> | null, o2: Pick<IPieceJointe, 'id'> | null): boolean {
    return o1 && o2 ? this.getPieceJointeIdentifier(o1) === this.getPieceJointeIdentifier(o2) : o1 === o2;
  }

  addPieceJointeToCollectionIfMissing<Type extends Pick<IPieceJointe, 'id'>>(
    pieceJointeCollection: Type[],
    ...pieceJointesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const pieceJointes: Type[] = pieceJointesToCheck.filter(isPresent);
    if (pieceJointes.length > 0) {
      const pieceJointeCollectionIdentifiers = pieceJointeCollection.map(
        pieceJointeItem => this.getPieceJointeIdentifier(pieceJointeItem)!
      );
      const pieceJointesToAdd = pieceJointes.filter(pieceJointeItem => {
        const pieceJointeIdentifier = this.getPieceJointeIdentifier(pieceJointeItem);
        if (pieceJointeCollectionIdentifiers.includes(pieceJointeIdentifier)) {
          return false;
        }
        pieceJointeCollectionIdentifiers.push(pieceJointeIdentifier);
        return true;
      });
      return [...pieceJointesToAdd, ...pieceJointeCollection];
    }
    return pieceJointeCollection;
  }

  protected convertDateFromClient<T extends IPieceJointe | NewPieceJointe | PartialUpdatePieceJointe>(pieceJointe: T): RestOf<T> {
    return {
      ...pieceJointe,
      dateUpload: pieceJointe.dateUpload?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restPieceJointe: RestPieceJointe): IPieceJointe {
    return {
      ...restPieceJointe,
      dateUpload: restPieceJointe.dateUpload ? dayjs(restPieceJointe.dateUpload) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPieceJointe>): HttpResponse<IPieceJointe> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPieceJointe[]>): HttpResponse<IPieceJointe[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
