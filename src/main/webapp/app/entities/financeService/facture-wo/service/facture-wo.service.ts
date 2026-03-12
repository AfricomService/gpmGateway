import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFactureWO, NewFactureWO } from '../facture-wo.model';

export type PartialUpdateFactureWO = Partial<IFactureWO> & Pick<IFactureWO, 'id'>;

export type EntityResponseType = HttpResponse<IFactureWO>;
export type EntityArrayResponseType = HttpResponse<IFactureWO[]>;

@Injectable({ providedIn: 'root' })
export class FactureWOService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/facture-wos', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(factureWO: NewFactureWO): Observable<EntityResponseType> {
    return this.http.post<IFactureWO>(this.resourceUrl, factureWO, { observe: 'response' });
  }

  update(factureWO: IFactureWO): Observable<EntityResponseType> {
    return this.http.put<IFactureWO>(`${this.resourceUrl}/${this.getFactureWOIdentifier(factureWO)}`, factureWO, { observe: 'response' });
  }

  partialUpdate(factureWO: PartialUpdateFactureWO): Observable<EntityResponseType> {
    return this.http.patch<IFactureWO>(`${this.resourceUrl}/${this.getFactureWOIdentifier(factureWO)}`, factureWO, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IFactureWO>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IFactureWO[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getFactureWOIdentifier(factureWO: Pick<IFactureWO, 'id'>): number {
    return factureWO.id;
  }

  compareFactureWO(o1: Pick<IFactureWO, 'id'> | null, o2: Pick<IFactureWO, 'id'> | null): boolean {
    return o1 && o2 ? this.getFactureWOIdentifier(o1) === this.getFactureWOIdentifier(o2) : o1 === o2;
  }

  addFactureWOToCollectionIfMissing<Type extends Pick<IFactureWO, 'id'>>(
    factureWOCollection: Type[],
    ...factureWOSToCheck: (Type | null | undefined)[]
  ): Type[] {
    const factureWOS: Type[] = factureWOSToCheck.filter(isPresent);
    if (factureWOS.length > 0) {
      const factureWOCollectionIdentifiers = factureWOCollection.map(factureWOItem => this.getFactureWOIdentifier(factureWOItem)!);
      const factureWOSToAdd = factureWOS.filter(factureWOItem => {
        const factureWOIdentifier = this.getFactureWOIdentifier(factureWOItem);
        if (factureWOCollectionIdentifiers.includes(factureWOIdentifier)) {
          return false;
        }
        factureWOCollectionIdentifiers.push(factureWOIdentifier);
        return true;
      });
      return [...factureWOSToAdd, ...factureWOCollection];
    }
    return factureWOCollection;
  }
}
