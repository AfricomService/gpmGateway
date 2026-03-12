import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IWoUtilisateur, NewWoUtilisateur } from '../wo-utilisateur.model';

export type PartialUpdateWoUtilisateur = Partial<IWoUtilisateur> & Pick<IWoUtilisateur, 'id'>;

export type EntityResponseType = HttpResponse<IWoUtilisateur>;
export type EntityArrayResponseType = HttpResponse<IWoUtilisateur[]>;

@Injectable({ providedIn: 'root' })
export class WoUtilisateurService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/wo-utilisateurs', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(woUtilisateur: NewWoUtilisateur): Observable<EntityResponseType> {
    return this.http.post<IWoUtilisateur>(this.resourceUrl, woUtilisateur, { observe: 'response' });
  }

  update(woUtilisateur: IWoUtilisateur): Observable<EntityResponseType> {
    return this.http.put<IWoUtilisateur>(`${this.resourceUrl}/${this.getWoUtilisateurIdentifier(woUtilisateur)}`, woUtilisateur, {
      observe: 'response',
    });
  }

  partialUpdate(woUtilisateur: PartialUpdateWoUtilisateur): Observable<EntityResponseType> {
    return this.http.patch<IWoUtilisateur>(`${this.resourceUrl}/${this.getWoUtilisateurIdentifier(woUtilisateur)}`, woUtilisateur, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IWoUtilisateur>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IWoUtilisateur[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getWoUtilisateurIdentifier(woUtilisateur: Pick<IWoUtilisateur, 'id'>): number {
    return woUtilisateur.id;
  }

  compareWoUtilisateur(o1: Pick<IWoUtilisateur, 'id'> | null, o2: Pick<IWoUtilisateur, 'id'> | null): boolean {
    return o1 && o2 ? this.getWoUtilisateurIdentifier(o1) === this.getWoUtilisateurIdentifier(o2) : o1 === o2;
  }

  addWoUtilisateurToCollectionIfMissing<Type extends Pick<IWoUtilisateur, 'id'>>(
    woUtilisateurCollection: Type[],
    ...woUtilisateursToCheck: (Type | null | undefined)[]
  ): Type[] {
    const woUtilisateurs: Type[] = woUtilisateursToCheck.filter(isPresent);
    if (woUtilisateurs.length > 0) {
      const woUtilisateurCollectionIdentifiers = woUtilisateurCollection.map(
        woUtilisateurItem => this.getWoUtilisateurIdentifier(woUtilisateurItem)!
      );
      const woUtilisateursToAdd = woUtilisateurs.filter(woUtilisateurItem => {
        const woUtilisateurIdentifier = this.getWoUtilisateurIdentifier(woUtilisateurItem);
        if (woUtilisateurCollectionIdentifiers.includes(woUtilisateurIdentifier)) {
          return false;
        }
        woUtilisateurCollectionIdentifiers.push(woUtilisateurIdentifier);
        return true;
      });
      return [...woUtilisateursToAdd, ...woUtilisateurCollection];
    }
    return woUtilisateurCollection;
  }
}
