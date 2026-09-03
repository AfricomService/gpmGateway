import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ILiaisonModelPhaseOT, NewLiaisonModelPhaseOT } from './liaison-model-phase-ot.model';

export type PartialUpdateLiaisonModelPhaseOT = Partial<ILiaisonModelPhaseOT> & Pick<ILiaisonModelPhaseOT, 'id'>;

export type EntityResponseType = HttpResponse<ILiaisonModelPhaseOT>;
export type EntityArrayResponseType = HttpResponse<ILiaisonModelPhaseOT[]>;

@Injectable({ providedIn: 'root' })
export class LiaisonModelPhaseOTService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/liaison-model-phase-ots', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  // ── Standard CRUD ────────────────────────────────────────────────────────

  create(liaison: NewLiaisonModelPhaseOT): Observable<EntityResponseType> {
    return this.http.post<ILiaisonModelPhaseOT>(this.resourceUrl, liaison, { observe: 'response' });
  }

  update(liaison: ILiaisonModelPhaseOT): Observable<EntityResponseType> {
    return this.http.put<ILiaisonModelPhaseOT>(`${this.resourceUrl}/${this.getLiaisonIdentifier(liaison)}`, liaison, {
      observe: 'response',
    });
  }

  partialUpdate(liaison: PartialUpdateLiaisonModelPhaseOT): Observable<EntityResponseType> {
    return this.http.patch<ILiaisonModelPhaseOT>(`${this.resourceUrl}/${this.getLiaisonIdentifier(liaison)}`, liaison, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ILiaisonModelPhaseOT>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILiaisonModelPhaseOT[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getLiaisonIdentifier(liaison: Pick<ILiaisonModelPhaseOT, 'id'>): number {
    return liaison.id;
  }

  addLiaisonToCollectionIfMissing<Type extends Pick<ILiaisonModelPhaseOT, 'id'>>(
    liaisonCollection: Type[],
    ...liaisonsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const liaisons: Type[] = liaisonsToCheck.filter(isPresent);
    if (liaisons.length > 0) {
      const liaisonCollectionIdentifiers = liaisonCollection.map(item => this.getLiaisonIdentifier(item)!);
      const liaisonsToAdd = liaisons.filter(item => {
        const identifier = this.getLiaisonIdentifier(item);
        if (liaisonCollectionIdentifiers.includes(identifier)) {
          return false;
        }
        liaisonCollectionIdentifiers.push(identifier);
        return true;
      });
      return [...liaisonsToAdd, ...liaisonCollection];
    }
    return liaisonCollection;
  }

  // ── Custom: ordered assignment workflow (ModelPhaseOT "Phases associées") ──

  /** All phases linked to a model, already ordered by classement (1st, 2nd, ...). */
  findByModel(modelPhaseOtId: number): Observable<ILiaisonModelPhaseOT[]> {
    return this.http.get<ILiaisonModelPhaseOT[]>(`${this.resourceUrl}/by-model/${modelPhaseOtId}`);
  }

  /** Links a PhaseOt to a model; server auto-assigns the classement and rejects duplicates. */
  assign(modelPhaseOtId: number, phaseId: number): Observable<EntityResponseType> {
    return this.http.post<ILiaisonModelPhaseOT>(`${this.resourceUrl}/assign`, { modelPhaseOtId, phaseId }, { observe: 'response' });
  }

  /** Unlinks a PhaseOt from its model; server renumbers the remaining phases. */
  unassign(liaisonId: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${liaisonId}/unassign`, { observe: 'response' });
  }

  /** Swaps this phase's classement with its predecessor. Returns the freshly-ordered list. */
  moveUp(liaisonId: number): Observable<ILiaisonModelPhaseOT[]> {
    return this.http.put<ILiaisonModelPhaseOT[]>(`${this.resourceUrl}/${liaisonId}/move-up`, null);
  }

  /** Swaps this phase's classement with its successor. Returns the freshly-ordered list. */
  moveDown(liaisonId: number): Observable<ILiaisonModelPhaseOT[]> {
    return this.http.put<ILiaisonModelPhaseOT[]>(`${this.resourceUrl}/${liaisonId}/move-down`, null);
  }
}
