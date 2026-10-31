import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IParametreWO, NewParametreWO } from '../parametre-wo.model';

export type PartialUpdateParametreWO = Partial<IParametreWO> & Pick<IParametreWO, 'id'>;

export type EntityResponseType = HttpResponse<IParametreWO>;
export type EntityArrayResponseType = HttpResponse<IParametreWO[]>;

@Injectable({ providedIn: 'root' })
export class ParametreWOService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/parametre-wos', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(parametreWO: NewParametreWO): Observable<EntityResponseType> {
    return this.http.post<IParametreWO>(this.resourceUrl, parametreWO, { observe: 'response' });
  }

  update(parametreWO: IParametreWO): Observable<EntityResponseType> {
    return this.http.put<IParametreWO>(`${this.resourceUrl}/${this.getParametreWOIdentifier(parametreWO)}`, parametreWO, {
      observe: 'response',
    });
  }

  partialUpdate(parametreWO: PartialUpdateParametreWO): Observable<EntityResponseType> {
    return this.http.patch<IParametreWO>(`${this.resourceUrl}/${this.getParametreWOIdentifier(parametreWO)}`, parametreWO, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IParametreWO>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IParametreWO[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getParametreWOIdentifier(parametreWO: Pick<IParametreWO, 'id'>): number {
    return parametreWO.id;
  }

  compareParametreWO(o1: Pick<IParametreWO, 'id'> | null, o2: Pick<IParametreWO, 'id'> | null): boolean {
    return o1 && o2 ? this.getParametreWOIdentifier(o1) === this.getParametreWOIdentifier(o2) : o1 === o2;
  }

  addParametreWOToCollectionIfMissing<Type extends Pick<IParametreWO, 'id'>>(
    parametreWOCollection: Type[],
    ...parametreWOSToCheck: (Type | null | undefined)[]
  ): Type[] {
    const parametreWOS: Type[] = parametreWOSToCheck.filter(isPresent);
    if (parametreWOS.length > 0) {
      const parametreWOCollectionIdentifiers = parametreWOCollection.map(
        parametreWOItem => this.getParametreWOIdentifier(parametreWOItem)!
      );
      const parametreWOSToAdd = parametreWOS.filter(parametreWOItem => {
        const parametreWOIdentifier = this.getParametreWOIdentifier(parametreWOItem);
        if (parametreWOCollectionIdentifiers.includes(parametreWOIdentifier)) {
          return false;
        }
        parametreWOCollectionIdentifiers.push(parametreWOIdentifier);
        return true;
      });
      return [...parametreWOSToAdd, ...parametreWOCollection];
    }
    return parametreWOCollection;
  }
}
