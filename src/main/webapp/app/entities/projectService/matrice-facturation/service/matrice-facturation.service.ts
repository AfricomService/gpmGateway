import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IMatriceFacturation, NewMatriceFacturation } from '../matrice-facturation.model';

export type PartialUpdateMatriceFacturation = Partial<IMatriceFacturation> & Pick<IMatriceFacturation, 'id'>;

export type EntityResponseType = HttpResponse<IMatriceFacturation>;
export type EntityArrayResponseType = HttpResponse<IMatriceFacturation[]>;

@Injectable({ providedIn: 'root' })
export class MatriceFacturationService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/matrice-facturations', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(matriceFacturation: NewMatriceFacturation): Observable<EntityResponseType> {
    return this.http.post<IMatriceFacturation>(this.resourceUrl, matriceFacturation, { observe: 'response' });
  }

  update(matriceFacturation: IMatriceFacturation): Observable<EntityResponseType> {
    return this.http.put<IMatriceFacturation>(
      `${this.resourceUrl}/${this.getMatriceFacturationIdentifier(matriceFacturation)}`,
      matriceFacturation,
      { observe: 'response' }
    );
  }

  partialUpdate(matriceFacturation: PartialUpdateMatriceFacturation): Observable<EntityResponseType> {
    return this.http.patch<IMatriceFacturation>(
      `${this.resourceUrl}/${this.getMatriceFacturationIdentifier(matriceFacturation)}`,
      matriceFacturation,
      { observe: 'response' }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IMatriceFacturation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IMatriceFacturation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getMatriceFacturationIdentifier(matriceFacturation: Pick<IMatriceFacturation, 'id'>): number {
    return matriceFacturation.id;
  }

  compareMatriceFacturation(o1: Pick<IMatriceFacturation, 'id'> | null, o2: Pick<IMatriceFacturation, 'id'> | null): boolean {
    return o1 && o2 ? this.getMatriceFacturationIdentifier(o1) === this.getMatriceFacturationIdentifier(o2) : o1 === o2;
  }

  addMatriceFacturationToCollectionIfMissing<Type extends Pick<IMatriceFacturation, 'id'>>(
    matriceFacturationCollection: Type[],
    ...matriceFacturationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const matriceFacturations: Type[] = matriceFacturationsToCheck.filter(isPresent);
    if (matriceFacturations.length > 0) {
      const matriceFacturationCollectionIdentifiers = matriceFacturationCollection.map(
        matriceFacturationItem => this.getMatriceFacturationIdentifier(matriceFacturationItem)!
      );
      const matriceFacturationsToAdd = matriceFacturations.filter(matriceFacturationItem => {
        const matriceFacturationIdentifier = this.getMatriceFacturationIdentifier(matriceFacturationItem);
        if (matriceFacturationCollectionIdentifiers.includes(matriceFacturationIdentifier)) {
          return false;
        }
        matriceFacturationCollectionIdentifiers.push(matriceFacturationIdentifier);
        return true;
      });
      return [...matriceFacturationsToAdd, ...matriceFacturationCollection];
    }
    return matriceFacturationCollection;
  }
}
