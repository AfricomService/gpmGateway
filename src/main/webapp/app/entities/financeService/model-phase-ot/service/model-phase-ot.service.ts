import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IModelPhaseOT, NewModelPhaseOT } from '../model-phase-ot.model';

export type PartialUpdateModelPhaseOT = Partial<IModelPhaseOT> & Pick<IModelPhaseOT, 'id'>;

export type EntityResponseType = HttpResponse<IModelPhaseOT>;
export type EntityArrayResponseType = HttpResponse<IModelPhaseOT[]>;

@Injectable({ providedIn: 'root' })
export class ModelPhaseOTService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/model-phase-ots', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(modelPhaseOT: NewModelPhaseOT): Observable<EntityResponseType> {
    return this.http.post<IModelPhaseOT>(this.resourceUrl, modelPhaseOT, { observe: 'response' });
  }

  update(modelPhaseOT: IModelPhaseOT): Observable<EntityResponseType> {
    return this.http.put<IModelPhaseOT>(`${this.resourceUrl}/${this.getModelPhaseOTIdentifier(modelPhaseOT)}`, modelPhaseOT, {
      observe: 'response',
    });
  }

  partialUpdate(modelPhaseOT: PartialUpdateModelPhaseOT): Observable<EntityResponseType> {
    return this.http.patch<IModelPhaseOT>(`${this.resourceUrl}/${this.getModelPhaseOTIdentifier(modelPhaseOT)}`, modelPhaseOT, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IModelPhaseOT>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IModelPhaseOT[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getModelPhaseOTIdentifier(modelPhaseOT: Pick<IModelPhaseOT, 'id'>): number {
    return modelPhaseOT.id;
  }

  compareModelPhaseOT(o1: Pick<IModelPhaseOT, 'id'> | null, o2: Pick<IModelPhaseOT, 'id'> | null): boolean {
    return o1 && o2 ? this.getModelPhaseOTIdentifier(o1) === this.getModelPhaseOTIdentifier(o2) : o1 === o2;
  }

  addModelPhaseOTToCollectionIfMissing<Type extends Pick<IModelPhaseOT, 'id'>>(
    modelPhaseOTCollection: Type[],
    ...modelPhaseOTSToCheck: (Type | null | undefined)[]
  ): Type[] {
    const modelPhaseOTS: Type[] = modelPhaseOTSToCheck.filter(isPresent);
    if (modelPhaseOTS.length > 0) {
      const modelPhaseOTCollectionIdentifiers = modelPhaseOTCollection.map(
        modelPhaseOTItem => this.getModelPhaseOTIdentifier(modelPhaseOTItem)!
      );
      const modelPhaseOTSToAdd = modelPhaseOTS.filter(modelPhaseOTItem => {
        const modelPhaseOTIdentifier = this.getModelPhaseOTIdentifier(modelPhaseOTItem);
        if (modelPhaseOTCollectionIdentifiers.includes(modelPhaseOTIdentifier)) {
          return false;
        }
        modelPhaseOTCollectionIdentifiers.push(modelPhaseOTIdentifier);
        return true;
      });
      return [...modelPhaseOTSToAdd, ...modelPhaseOTCollection];
    }
    return modelPhaseOTCollection;
  }
}
