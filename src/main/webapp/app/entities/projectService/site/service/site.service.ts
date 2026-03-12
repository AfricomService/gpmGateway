import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISite, NewSite } from '../site.model';

export type PartialUpdateSite = Partial<ISite> & Pick<ISite, 'id'>;

type RestOf<T extends ISite | NewSite> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestSite = RestOf<ISite>;

export type NewRestSite = RestOf<NewSite>;

export type PartialUpdateRestSite = RestOf<PartialUpdateSite>;

export type EntityResponseType = HttpResponse<ISite>;
export type EntityArrayResponseType = HttpResponse<ISite[]>;

@Injectable({ providedIn: 'root' })
export class SiteService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sites', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(site: NewSite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(site);
    return this.http.post<RestSite>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(site: ISite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(site);
    return this.http
      .put<RestSite>(`${this.resourceUrl}/${this.getSiteIdentifier(site)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(site: PartialUpdateSite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(site);
    return this.http
      .patch<RestSite>(`${this.resourceUrl}/${this.getSiteIdentifier(site)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestSite>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSite[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSiteIdentifier(site: Pick<ISite, 'id'>): number {
    return site.id;
  }

  compareSite(o1: Pick<ISite, 'id'> | null, o2: Pick<ISite, 'id'> | null): boolean {
    return o1 && o2 ? this.getSiteIdentifier(o1) === this.getSiteIdentifier(o2) : o1 === o2;
  }

  addSiteToCollectionIfMissing<Type extends Pick<ISite, 'id'>>(
    siteCollection: Type[],
    ...sitesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const sites: Type[] = sitesToCheck.filter(isPresent);
    if (sites.length > 0) {
      const siteCollectionIdentifiers = siteCollection.map(siteItem => this.getSiteIdentifier(siteItem)!);
      const sitesToAdd = sites.filter(siteItem => {
        const siteIdentifier = this.getSiteIdentifier(siteItem);
        if (siteCollectionIdentifiers.includes(siteIdentifier)) {
          return false;
        }
        siteCollectionIdentifiers.push(siteIdentifier);
        return true;
      });
      return [...sitesToAdd, ...siteCollection];
    }
    return siteCollection;
  }

  protected convertDateFromClient<T extends ISite | NewSite | PartialUpdateSite>(site: T): RestOf<T> {
    return {
      ...site,
      createdAt: site.createdAt?.toJSON() ?? null,
      updatedAt: site.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restSite: RestSite): ISite {
    return {
      ...restSite,
      createdAt: restSite.createdAt ? dayjs(restSite.createdAt) : undefined,
      updatedAt: restSite.updatedAt ? dayjs(restSite.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestSite>): HttpResponse<ISite> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestSite[]>): HttpResponse<ISite[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
