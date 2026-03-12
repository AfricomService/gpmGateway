import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IWoSite, NewWoSite } from '../wo-site.model';

export type PartialUpdateWoSite = Partial<IWoSite> & Pick<IWoSite, 'id'>;

export type EntityResponseType = HttpResponse<IWoSite>;
export type EntityArrayResponseType = HttpResponse<IWoSite[]>;

@Injectable({ providedIn: 'root' })
export class WoSiteService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/wo-sites', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(woSite: NewWoSite): Observable<EntityResponseType> {
    return this.http.post<IWoSite>(this.resourceUrl, woSite, { observe: 'response' });
  }

  update(woSite: IWoSite): Observable<EntityResponseType> {
    return this.http.put<IWoSite>(`${this.resourceUrl}/${this.getWoSiteIdentifier(woSite)}`, woSite, { observe: 'response' });
  }

  partialUpdate(woSite: PartialUpdateWoSite): Observable<EntityResponseType> {
    return this.http.patch<IWoSite>(`${this.resourceUrl}/${this.getWoSiteIdentifier(woSite)}`, woSite, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IWoSite>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IWoSite[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getWoSiteIdentifier(woSite: Pick<IWoSite, 'id'>): number {
    return woSite.id;
  }

  compareWoSite(o1: Pick<IWoSite, 'id'> | null, o2: Pick<IWoSite, 'id'> | null): boolean {
    return o1 && o2 ? this.getWoSiteIdentifier(o1) === this.getWoSiteIdentifier(o2) : o1 === o2;
  }

  addWoSiteToCollectionIfMissing<Type extends Pick<IWoSite, 'id'>>(
    woSiteCollection: Type[],
    ...woSitesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const woSites: Type[] = woSitesToCheck.filter(isPresent);
    if (woSites.length > 0) {
      const woSiteCollectionIdentifiers = woSiteCollection.map(woSiteItem => this.getWoSiteIdentifier(woSiteItem)!);
      const woSitesToAdd = woSites.filter(woSiteItem => {
        const woSiteIdentifier = this.getWoSiteIdentifier(woSiteItem);
        if (woSiteCollectionIdentifiers.includes(woSiteIdentifier)) {
          return false;
        }
        woSiteCollectionIdentifiers.push(woSiteIdentifier);
        return true;
      });
      return [...woSitesToAdd, ...woSiteCollection];
    }
    return woSiteCollection;
  }
}
