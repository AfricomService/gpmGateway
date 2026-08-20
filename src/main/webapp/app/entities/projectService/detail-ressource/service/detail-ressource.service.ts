import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDetailRessource, NewDetailRessource } from '../detail-ressource.model';

export type PartialUpdateDetailRessource = Partial<IDetailRessource> & Pick<IDetailRessource, 'id'>;

export type EntityResponseType = HttpResponse<IDetailRessource>;
export type EntityArrayResponseType = HttpResponse<IDetailRessource[]>;

@Injectable({ providedIn: 'root' })
export class DetailRessourceService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/detail-ressources', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(detailRessource: NewDetailRessource): Observable<EntityResponseType> {
    return this.http.post<IDetailRessource>(this.resourceUrl, detailRessource, { observe: 'response' });
  }

  update(detailRessource: IDetailRessource): Observable<EntityResponseType> {
    return this.http.put<IDetailRessource>(`${this.resourceUrl}/${this.getDetailRessourceIdentifier(detailRessource)}`, detailRessource, {
      observe: 'response',
    });
  }

  partialUpdate(detailRessource: PartialUpdateDetailRessource): Observable<EntityResponseType> {
    return this.http.patch<IDetailRessource>(`${this.resourceUrl}/${this.getDetailRessourceIdentifier(detailRessource)}`, detailRessource, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IDetailRessource>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IDetailRessource[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDetailRessourceIdentifier(detailRessource: Pick<IDetailRessource, 'id'>): number {
    return detailRessource.id;
  }

  compareDetailRessource(o1: Pick<IDetailRessource, 'id'> | null, o2: Pick<IDetailRessource, 'id'> | null): boolean {
    return o1 && o2 ? this.getDetailRessourceIdentifier(o1) === this.getDetailRessourceIdentifier(o2) : o1 === o2;
  }

  addDetailRessourceToCollectionIfMissing<Type extends Pick<IDetailRessource, 'id'>>(
    detailRessourceCollection: Type[],
    ...detailRessourcesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const detailRessources: Type[] = detailRessourcesToCheck.filter(isPresent);
    if (detailRessources.length > 0) {
      const detailRessourceCollectionIdentifiers = detailRessourceCollection.map(
        detailRessourceItem => this.getDetailRessourceIdentifier(detailRessourceItem)!
      );
      const detailRessourcesToAdd = detailRessources.filter(detailRessourceItem => {
        const detailRessourceIdentifier = this.getDetailRessourceIdentifier(detailRessourceItem);
        if (detailRessourceCollectionIdentifiers.includes(detailRessourceIdentifier)) {
          return false;
        }
        detailRessourceCollectionIdentifiers.push(detailRessourceIdentifier);
        return true;
      });
      return [...detailRessourcesToAdd, ...detailRessourceCollection];
    }
    return detailRessourceCollection;
  }
}
