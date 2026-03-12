import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IMatriceJourFerie, NewMatriceJourFerie } from '../matrice-jour-ferie.model';

export type PartialUpdateMatriceJourFerie = Partial<IMatriceJourFerie> & Pick<IMatriceJourFerie, 'id'>;

export type EntityResponseType = HttpResponse<IMatriceJourFerie>;
export type EntityArrayResponseType = HttpResponse<IMatriceJourFerie[]>;

@Injectable({ providedIn: 'root' })
export class MatriceJourFerieService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/matrice-jour-feries', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(matriceJourFerie: NewMatriceJourFerie): Observable<EntityResponseType> {
    return this.http.post<IMatriceJourFerie>(this.resourceUrl, matriceJourFerie, { observe: 'response' });
  }

  update(matriceJourFerie: IMatriceJourFerie): Observable<EntityResponseType> {
    return this.http.put<IMatriceJourFerie>(
      `${this.resourceUrl}/${this.getMatriceJourFerieIdentifier(matriceJourFerie)}`,
      matriceJourFerie,
      { observe: 'response' }
    );
  }

  partialUpdate(matriceJourFerie: PartialUpdateMatriceJourFerie): Observable<EntityResponseType> {
    return this.http.patch<IMatriceJourFerie>(
      `${this.resourceUrl}/${this.getMatriceJourFerieIdentifier(matriceJourFerie)}`,
      matriceJourFerie,
      { observe: 'response' }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IMatriceJourFerie>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IMatriceJourFerie[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getMatriceJourFerieIdentifier(matriceJourFerie: Pick<IMatriceJourFerie, 'id'>): number {
    return matriceJourFerie.id;
  }

  compareMatriceJourFerie(o1: Pick<IMatriceJourFerie, 'id'> | null, o2: Pick<IMatriceJourFerie, 'id'> | null): boolean {
    return o1 && o2 ? this.getMatriceJourFerieIdentifier(o1) === this.getMatriceJourFerieIdentifier(o2) : o1 === o2;
  }

  addMatriceJourFerieToCollectionIfMissing<Type extends Pick<IMatriceJourFerie, 'id'>>(
    matriceJourFerieCollection: Type[],
    ...matriceJourFeriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const matriceJourFeries: Type[] = matriceJourFeriesToCheck.filter(isPresent);
    if (matriceJourFeries.length > 0) {
      const matriceJourFerieCollectionIdentifiers = matriceJourFerieCollection.map(
        matriceJourFerieItem => this.getMatriceJourFerieIdentifier(matriceJourFerieItem)!
      );
      const matriceJourFeriesToAdd = matriceJourFeries.filter(matriceJourFerieItem => {
        const matriceJourFerieIdentifier = this.getMatriceJourFerieIdentifier(matriceJourFerieItem);
        if (matriceJourFerieCollectionIdentifiers.includes(matriceJourFerieIdentifier)) {
          return false;
        }
        matriceJourFerieCollectionIdentifiers.push(matriceJourFerieIdentifier);
        return true;
      });
      return [...matriceJourFeriesToAdd, ...matriceJourFerieCollection];
    }
    return matriceJourFerieCollection;
  }
}
