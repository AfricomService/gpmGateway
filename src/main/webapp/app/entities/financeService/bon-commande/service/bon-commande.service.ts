import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IBonCommande, NewBonCommande } from '../bon-commande.model';
import { IContactSociete } from 'app/entities/projectService/societe/contact-societe.model';
import { IRoleContactSociete } from 'app/entities/projectService/societe/role-contact-societe.model';

export type PartialUpdateBonCommande = Partial<IBonCommande> & Pick<IBonCommande, 'id'>;

type RestOf<T extends IBonCommande | NewBonCommande> = Omit<T, 'dateBonCommande'> & {
  dateBonCommande?: string | null;
};

export type RestBonCommande = RestOf<IBonCommande>;

export type NewRestBonCommande = RestOf<NewBonCommande>;

export type PartialUpdateRestBonCommande = RestOf<PartialUpdateBonCommande>;

export type EntityResponseType = HttpResponse<IBonCommande>;
export type EntityArrayResponseType = HttpResponse<IBonCommande[]>;

@Injectable({ providedIn: 'root' })
export class BonCommandeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/bon-commandes', 'financeservice');

  protected contactSocieteResourceUrl = this.applicationConfigService.getEndpointFor('api/contact-societes', 'projectservice');

  protected roleContactSocieteResourceUrl = this.applicationConfigService.getEndpointFor('api/role-contact-societes', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(bonCommande: NewBonCommande): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bonCommande);
    return this.http
      .post<RestBonCommande>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(bonCommande: IBonCommande): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bonCommande);
    return this.http
      .put<RestBonCommande>(`${this.resourceUrl}/${this.getBonCommandeIdentifier(bonCommande)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(bonCommande: PartialUpdateBonCommande): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bonCommande);
    return this.http
      .patch<RestBonCommande>(`${this.resourceUrl}/${this.getBonCommandeIdentifier(bonCommande)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestBonCommande>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestBonCommande[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  /**
   * Récupère un contact (responsable) par son id.
   */
  findResponsableById(id: number): Observable<HttpResponse<IContactSociete>> {
    return this.http.get<IContactSociete>(`${this.contactSocieteResourceUrl}/${id}`, { observe: 'response' });
  }

  /**
   * Récupère les contacts ayant un rôle donné (ex: MANAGER), pour peupler la liste des responsables.
   */
  findResponsablesByRole(roleCode: string): Observable<HttpResponse<IContactSociete[]>> {
    return this.http.get<IContactSociete[]>(`${this.contactSocieteResourceUrl}/by-role/${roleCode}`, { observe: 'response' });
  }

  /**
   * Récupère la liste des rôles (table role_contact_societe) pour peupler les boutons de filtre
   * dans la modale de sélection de contact (Responsable / Autre Responsable).
   */
  findAllRoles(): Observable<HttpResponse<IRoleContactSociete[]>> {
    return this.http.get<IRoleContactSociete[]>(this.roleContactSocieteResourceUrl, { observe: 'response' });
  }

  getBonCommandeIdentifier(bonCommande: Pick<IBonCommande, 'id'>): number {
    return bonCommande.id;
  }

  compareBonCommande(o1: Pick<IBonCommande, 'id'> | null, o2: Pick<IBonCommande, 'id'> | null): boolean {
    return o1 && o2 ? this.getBonCommandeIdentifier(o1) === this.getBonCommandeIdentifier(o2) : o1 === o2;
  }

  addBonCommandeToCollectionIfMissing<Type extends Pick<IBonCommande, 'id'>>(
    bonCommandeCollection: Type[],
    ...bonCommandesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const bonCommandes: Type[] = bonCommandesToCheck.filter(isPresent);
    if (bonCommandes.length > 0) {
      const bonCommandeCollectionIdentifiers = bonCommandeCollection.map(
        bonCommandeItem => this.getBonCommandeIdentifier(bonCommandeItem)!
      );
      const bonCommandesToAdd = bonCommandes.filter(bonCommandeItem => {
        const bonCommandeIdentifier = this.getBonCommandeIdentifier(bonCommandeItem);
        if (bonCommandeCollectionIdentifiers.includes(bonCommandeIdentifier)) {
          return false;
        }
        bonCommandeCollectionIdentifiers.push(bonCommandeIdentifier);
        return true;
      });
      return [...bonCommandesToAdd, ...bonCommandeCollection];
    }
    return bonCommandeCollection;
  }

  protected convertDateFromClient<T extends IBonCommande | NewBonCommande | PartialUpdateBonCommande>(bonCommande: T): RestOf<T> {
    return {
      ...bonCommande,
      dateBonCommande: bonCommande.dateBonCommande?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restBonCommande: RestBonCommande): IBonCommande {
    return {
      ...restBonCommande,
      dateBonCommande: restBonCommande.dateBonCommande ? dayjs(restBonCommande.dateBonCommande) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestBonCommande>): HttpResponse<IBonCommande> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestBonCommande[]>): HttpResponse<IBonCommande[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
