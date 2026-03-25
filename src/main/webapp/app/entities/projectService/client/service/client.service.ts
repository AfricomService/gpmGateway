import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IClient, NewClient } from '../client.model';
import { ISite } from 'app/entities/projectService/site/site.model';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { IFacture } from 'app/entities/financeService/facture/facture.model';

export type PartialUpdateClient = Partial<IClient> & Pick<IClient, 'id'>;

type RestOf<T extends IClient | NewClient> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestClient = RestOf<IClient>;

export type NewRestClient = RestOf<NewClient>;

export type PartialUpdateRestClient = RestOf<PartialUpdateClient>;

export type EntityResponseType = HttpResponse<IClient>;
export type EntityArrayResponseType = HttpResponse<IClient[]>;

@Injectable({ providedIn: 'root' })
export class ClientService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/clients', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(client: NewClient): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(client);
    return this.http
      .post<RestClient>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(client: IClient): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(client);
    return this.http
      .put<RestClient>(`${this.resourceUrl}/${this.getClientIdentifier(client)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(client: PartialUpdateClient): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(client);
    return this.http
      .patch<RestClient>(`${this.resourceUrl}/${this.getClientIdentifier(client)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestClient>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestClient[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getContactsByClientId(clientId: number): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.applicationConfigService.getEndpointFor('api/contacts/client', 'projectservice')}/${clientId}`, {
      observe: 'response',
    });
  }

  getSitesByClientId(clientId: number): Observable<HttpResponse<ISite[]>> {
    return this.http.get<ISite[]>(`${this.applicationConfigService.getEndpointFor('api/sites/client', 'projectservice')}/${clientId}`, {
      observe: 'response',
    });
  }

  getAffairesByClientId(clientId: number): Observable<HttpResponse<IAffaire[]>> {
    return this.http.get<IAffaire[]>(
      `${this.applicationConfigService.getEndpointFor('api/affaires/client', 'projectservice')}/${clientId}`,
      { observe: 'response' }
    );
  }

  getFacturesByClientId(clientId: number): Observable<HttpResponse<IFacture[]>> {
    return this.http.get<IFacture[]>(
      `${this.applicationConfigService.getEndpointFor('api/factures/client', 'financeservice')}/${clientId}`,
      { observe: 'response' }
    );
  }

  getClientIdentifier(client: Pick<IClient, 'id'>): number {
    return client.id;
  }

  compareClient(o1: Pick<IClient, 'id'> | null, o2: Pick<IClient, 'id'> | null): boolean {
    return o1 && o2 ? this.getClientIdentifier(o1) === this.getClientIdentifier(o2) : o1 === o2;
  }

  addClientToCollectionIfMissing<Type extends Pick<IClient, 'id'>>(
    clientCollection: Type[],
    ...clientsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const clients: Type[] = clientsToCheck.filter(isPresent);
    if (clients.length > 0) {
      const clientCollectionIdentifiers = clientCollection.map(clientItem => this.getClientIdentifier(clientItem)!);
      const clientsToAdd = clients.filter(clientItem => {
        const clientIdentifier = this.getClientIdentifier(clientItem);
        if (clientCollectionIdentifiers.includes(clientIdentifier)) {
          return false;
        }
        clientCollectionIdentifiers.push(clientIdentifier);
        return true;
      });
      return [...clientsToAdd, ...clientCollection];
    }
    return clientCollection;
  }

  protected convertDateFromClient<T extends IClient | NewClient | PartialUpdateClient>(client: T): RestOf<T> {
    return {
      ...client,
      createdAt: client.createdAt?.toJSON() ?? null,
      updatedAt: client.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restClient: RestClient): IClient {
    return {
      ...restClient,
      createdAt: restClient.createdAt ? dayjs(restClient.createdAt) : undefined,
      updatedAt: restClient.updatedAt ? dayjs(restClient.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestClient>): HttpResponse<IClient> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestClient[]>): HttpResponse<IClient[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
