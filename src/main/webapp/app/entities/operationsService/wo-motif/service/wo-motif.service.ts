import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IWoMotif, NewWoMotif } from '../wo-motif.model';

export type PartialUpdateWoMotif = Partial<IWoMotif> & Pick<IWoMotif, 'id'>;

export type EntityResponseType = HttpResponse<IWoMotif>;
export type EntityArrayResponseType = HttpResponse<IWoMotif[]>;

@Injectable({ providedIn: 'root' })
export class WoMotifService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/wo-motifs', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(woMotif: NewWoMotif): Observable<EntityResponseType> {
    return this.http.post<IWoMotif>(this.resourceUrl, woMotif, { observe: 'response' });
  }

  update(woMotif: IWoMotif): Observable<EntityResponseType> {
    return this.http.put<IWoMotif>(`${this.resourceUrl}/${this.getWoMotifIdentifier(woMotif)}`, woMotif, { observe: 'response' });
  }

  partialUpdate(woMotif: PartialUpdateWoMotif): Observable<EntityResponseType> {
    return this.http.patch<IWoMotif>(`${this.resourceUrl}/${this.getWoMotifIdentifier(woMotif)}`, woMotif, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IWoMotif>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IWoMotif[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getWoMotifIdentifier(woMotif: Pick<IWoMotif, 'id'>): number {
    return woMotif.id;
  }

  compareWoMotif(o1: Pick<IWoMotif, 'id'> | null, o2: Pick<IWoMotif, 'id'> | null): boolean {
    return o1 && o2 ? this.getWoMotifIdentifier(o1) === this.getWoMotifIdentifier(o2) : o1 === o2;
  }

  addWoMotifToCollectionIfMissing<Type extends Pick<IWoMotif, 'id'>>(
    woMotifCollection: Type[],
    ...woMotifsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const woMotifs: Type[] = woMotifsToCheck.filter(isPresent);
    if (woMotifs.length > 0) {
      const woMotifCollectionIdentifiers = woMotifCollection.map(woMotifItem => this.getWoMotifIdentifier(woMotifItem)!);
      const woMotifsToAdd = woMotifs.filter(woMotifItem => {
        const woMotifIdentifier = this.getWoMotifIdentifier(woMotifItem);
        if (woMotifCollectionIdentifiers.includes(woMotifIdentifier)) {
          return false;
        }
        woMotifCollectionIdentifiers.push(woMotifIdentifier);
        return true;
      });
      return [...woMotifsToAdd, ...woMotifCollection];
    }
    return woMotifCollection;
  }
}
