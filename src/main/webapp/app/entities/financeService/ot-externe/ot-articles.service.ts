import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IOtArticles, NewOtArticles } from './ot-articles.model'; // adjust path to match your folder

export type PartialUpdateOtArticles = Partial<IOtArticles> & Pick<IOtArticles, 'id'>;

type RestOf<T extends IOtArticles | NewOtArticles> = Omit<T, 'dateAffectation'> & {
  dateAffectation?: string | null;
};

export type RestOtArticles = RestOf<IOtArticles>;
export type NewRestOtArticles = RestOf<NewOtArticles>;
export type PartialUpdateRestOtArticles = RestOf<PartialUpdateOtArticles>;

export type EntityResponseType = HttpResponse<IOtArticles>;
export type EntityArrayResponseType = HttpResponse<IOtArticles[]>;

@Injectable({ providedIn: 'root' })
export class OtArticlesService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/ot-articles', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(otArticles: NewOtArticles): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(otArticles);
    return this.http
      .post<RestOtArticles>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(otArticles: IOtArticles): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(otArticles);
    return this.http
      .put<RestOtArticles>(`${this.resourceUrl}/${this.getOtArticlesIdentifier(otArticles)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(otArticles: PartialUpdateOtArticles): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(otArticles);
    return this.http
      .patch<RestOtArticles>(`${this.resourceUrl}/${this.getOtArticlesIdentifier(otArticles)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestOtArticles>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOtArticles[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  findByOtId(otId: number): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestOtArticles[]>(`${this.resourceUrl}/by-ot/${otId}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  getOtArticlesIdentifier(otArticles: Pick<IOtArticles, 'id'>): number {
    return otArticles.id;
  }

  protected convertDateFromClient<T extends IOtArticles | NewOtArticles | PartialUpdateOtArticles>(otArticles: T): RestOf<T> {
    return {
      ...otArticles,
      dateAffectation: otArticles.dateAffectation?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restOtArticles: RestOtArticles): IOtArticles {
    return {
      ...restOtArticles,
      dateAffectation: restOtArticles.dateAffectation ? dayjs(restOtArticles.dateAffectation) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestOtArticles>): HttpResponse<IOtArticles> {
    return res.clone({ body: res.body ? this.convertDateFromServer(res.body) : null });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestOtArticles[]>): HttpResponse<IOtArticles[]> {
    return res.clone({ body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null });
  }
}
