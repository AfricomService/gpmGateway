import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITypeRessource, NewTypeRessource } from '../type-ressource.model';
import { IDetailRessource } from 'app/entities/projectService/detail-ressource/detail-ressource.model';

export type PartialUpdateTypeRessource = Partial<ITypeRessource> & Pick<ITypeRessource, 'id'>;

export type EntityResponseType = HttpResponse<ITypeRessource>;
export type EntityArrayResponseType = HttpResponse<ITypeRessource[]>;

@Injectable({ providedIn: 'root' })
export class TypeRessourceService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/type-ressources', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(typeRessource: NewTypeRessource): Observable<EntityResponseType> {
    return this.http.post<ITypeRessource>(this.resourceUrl, typeRessource, { observe: 'response' });
  }

  update(typeRessource: ITypeRessource): Observable<EntityResponseType> {
    return this.http.put<ITypeRessource>(`${this.resourceUrl}/${this.getTypeRessourceIdentifier(typeRessource)}`, typeRessource, {
      observe: 'response',
    });
  }

  partialUpdate(typeRessource: PartialUpdateTypeRessource): Observable<EntityResponseType> {
    return this.http.patch<ITypeRessource>(`${this.resourceUrl}/${this.getTypeRessourceIdentifier(typeRessource)}`, typeRessource, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITypeRessource>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITypeRessource[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  queryList(): Observable<HttpResponse<ITypeRessource[]>> {
    return this.http.get<ITypeRessource[]>(`${this.resourceUrl}/list`, { observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTypeRessourceIdentifier(typeRessource: Pick<ITypeRessource, 'id'>): number {
    return typeRessource.id;
  }

  compareTypeRessource(o1: Pick<ITypeRessource, 'id'> | null, o2: Pick<ITypeRessource, 'id'> | null): boolean {
    return o1 && o2 ? this.getTypeRessourceIdentifier(o1) === this.getTypeRessourceIdentifier(o2) : o1 === o2;
  }

  addTypeRessourceToCollectionIfMissing<Type extends Pick<ITypeRessource, 'id'>>(
    typeRessourceCollection: Type[],
    ...typeRessourcesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const typeRessources: Type[] = typeRessourcesToCheck.filter(isPresent);
    if (typeRessources.length > 0) {
      const typeRessourceCollectionIdentifiers = typeRessourceCollection.map(
        typeRessourceItem => this.getTypeRessourceIdentifier(typeRessourceItem)!
      );
      const typeRessourcesToAdd = typeRessources.filter(typeRessourceItem => {
        const typeRessourceIdentifier = this.getTypeRessourceIdentifier(typeRessourceItem);
        if (typeRessourceCollectionIdentifiers.includes(typeRessourceIdentifier)) {
          return false;
        }
        typeRessourceCollectionIdentifiers.push(typeRessourceIdentifier);
        return true;
      });
      return [...typeRessourcesToAdd, ...typeRessourceCollection];
    }
    return typeRessourceCollection;
  }

  // === Affectation DetailRessource ===

  findDetails(typeRessourceId: number): Observable<HttpResponse<IDetailRessource[]>> {
    return this.http.get<IDetailRessource[]>(`${this.resourceUrl}/${typeRessourceId}/details`, { observe: 'response' });
  }

  replaceDetails(typeRessourceId: number, detailRessourceIds: number[]): Observable<HttpResponse<IDetailRessource[]>> {
    return this.http.put<IDetailRessource[]>(`${this.resourceUrl}/${typeRessourceId}/details`, detailRessourceIds, {
      observe: 'response',
    });
  }

  addDetail(typeRessourceId: number, detailRessourceId: number): Observable<HttpResponse<{}>> {
    return this.http.post(`${this.resourceUrl}/${typeRessourceId}/details/${detailRessourceId}`, null, { observe: 'response' });
  }

  removeDetail(typeRessourceId: number, detailRessourceId: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${typeRessourceId}/details/${detailRessourceId}`, { observe: 'response' });
  }
}
