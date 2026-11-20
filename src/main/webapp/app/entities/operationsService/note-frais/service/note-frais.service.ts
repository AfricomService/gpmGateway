import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { INoteFrais, NewNoteFrais } from '../note-frais.model';

export type PartialUpdateNoteFrais = Partial<INoteFrais> & Pick<INoteFrais, 'id'>;

type RestOf<T extends INoteFrais | NewNoteFrais> = Omit<T, 'dateDebut' | 'dateFin'> & {
  dateDebut?: string | null;
  dateFin?: string | null;
};

export type RestNoteFrais = RestOf<INoteFrais>;

export type NewRestNoteFrais = RestOf<NewNoteFrais>;

export type PartialUpdateRestNoteFrais = RestOf<PartialUpdateNoteFrais>;

export type EntityResponseType = HttpResponse<INoteFrais>;
export type EntityArrayResponseType = HttpResponse<INoteFrais[]>;

@Injectable({ providedIn: 'root' })
export class NoteFraisService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/note-frais', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(noteFrais: NewNoteFrais): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(noteFrais);
    return this.http
      .post<RestNoteFrais>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  /** Montant converti en lettres par le backend (même logique que celle persistée). */
  montantEnLettres(montant: number): Observable<string> {
    const params = new HttpParams().set('montant', montant);
    return this.http.get(`${this.resourceUrl}/montant-en-lettres`, { params, responseType: 'text' });
  }

  createFromMissions(noteFrais: NewNoteFrais, missionIds: number[]): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(noteFrais);
    const body = {
      dateDebut: copy.dateDebut,
      dateFin: copy.dateFin,
      contactSocieteId: copy.contactSocieteId,
      missionIds,
    };
    return this.http
      .post<RestNoteFrais>(`${this.resourceUrl}/from-missions`, body, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(noteFrais: INoteFrais): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(noteFrais);
    return this.http
      .put<RestNoteFrais>(`${this.resourceUrl}/${this.getNoteFraisIdentifier(noteFrais)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(noteFrais: PartialUpdateNoteFrais): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(noteFrais);
    return this.http
      .patch<RestNoteFrais>(`${this.resourceUrl}/${this.getNoteFraisIdentifier(noteFrais)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestNoteFrais>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestNoteFrais[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getNoteFraisIdentifier(noteFrais: Pick<INoteFrais, 'id'>): number {
    return noteFrais.id;
  }

  compareNoteFrais(o1: Pick<INoteFrais, 'id'> | null, o2: Pick<INoteFrais, 'id'> | null): boolean {
    return o1 && o2 ? this.getNoteFraisIdentifier(o1) === this.getNoteFraisIdentifier(o2) : o1 === o2;
  }

  addNoteFraisToCollectionIfMissing<Type extends Pick<INoteFrais, 'id'>>(
    noteFraisCollection: Type[],
    ...noteFraisToCheck: (Type | null | undefined)[]
  ): Type[] {
    const noteFrais: Type[] = noteFraisToCheck.filter(isPresent);
    if (noteFrais.length > 0) {
      const noteFraisCollectionIdentifiers = noteFraisCollection.map(noteFraisItem => this.getNoteFraisIdentifier(noteFraisItem)!);
      const noteFraisToAdd = noteFrais.filter(noteFraisItem => {
        const noteFraisIdentifier = this.getNoteFraisIdentifier(noteFraisItem);
        if (noteFraisCollectionIdentifiers.includes(noteFraisIdentifier)) {
          return false;
        }
        noteFraisCollectionIdentifiers.push(noteFraisIdentifier);
        return true;
      });
      return [...noteFraisToAdd, ...noteFraisCollection];
    }
    return noteFraisCollection;
  }

  protected convertDateFromClient<T extends INoteFrais | NewNoteFrais | PartialUpdateNoteFrais>(noteFrais: T): RestOf<T> {
    return {
      ...noteFrais,
      dateDebut: noteFrais.dateDebut?.toJSON() ?? null,
      dateFin: noteFrais.dateFin?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restNoteFrais: RestNoteFrais): INoteFrais {
    return {
      ...restNoteFrais,
      dateDebut: restNoteFrais.dateDebut ? dayjs(restNoteFrais.dateDebut) : undefined,
      dateFin: restNoteFrais.dateFin ? dayjs(restNoteFrais.dateFin) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestNoteFrais>): HttpResponse<INoteFrais> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestNoteFrais[]>): HttpResponse<INoteFrais[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
