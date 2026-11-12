import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IWoArticles } from '../wo-articles.model';

type RestWoArticles = Omit<IWoArticles, 'dateRealisation'> & { dateRealisation?: string | null };

export type WoArticlesArrayResponseType = HttpResponse<IWoArticles[]>;

@Injectable({ providedIn: 'root' })
export class WoArticlesService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/wo-articles', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  /** Articles affectés à un work order. */
  findByWo(woId: number): Observable<WoArticlesArrayResponseType> {
    return this.http
      .get<RestWoArticles[]>(`${this.resourceUrl}/by-wo/${woId}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /** Synchronise la liste des articles d'un work order (mise à jour en place côté backend). */
  replaceForWo(woId: number, woArticles: Partial<IWoArticles>[]): Observable<WoArticlesArrayResponseType> {
    return this.http
      .put<RestWoArticles[]>(`${this.resourceUrl}/wo/${woId}`, woArticles, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestWoArticles[]>): HttpResponse<IWoArticles[]> {
    return res.clone({
      body: res.body
        ? res.body.map(item => ({ ...item, dateRealisation: item.dateRealisation ? dayjs(item.dateRealisation) : undefined }))
        : null,
    });
  }
}
