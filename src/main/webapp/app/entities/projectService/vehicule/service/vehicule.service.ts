import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IVehicule, NewVehicule } from '../vehicule.model';

export type PartialUpdateVehicule = Partial<IVehicule> & Pick<IVehicule, 'id'>;

type RestOf<T extends IVehicule | NewVehicule> = Omit<T, 'dateCirculation' | 'createdAt' | 'updatedAt'> & {
  dateCirculation?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestVehicule = RestOf<IVehicule>;

export type NewRestVehicule = RestOf<NewVehicule>;

export type PartialUpdateRestVehicule = RestOf<PartialUpdateVehicule>;

export type EntityResponseType = HttpResponse<IVehicule>;
export type EntityArrayResponseType = HttpResponse<IVehicule[]>;

@Injectable({ providedIn: 'root' })
export class VehiculeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/vehicules', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(vehicule: NewVehicule): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vehicule);
    return this.http
      .post<RestVehicule>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(vehicule: IVehicule): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vehicule);
    return this.http
      .put<RestVehicule>(`${this.resourceUrl}/${this.getVehiculeIdentifier(vehicule)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(vehicule: PartialUpdateVehicule): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(vehicule);
    return this.http
      .patch<RestVehicule>(`${this.resourceUrl}/${this.getVehiculeIdentifier(vehicule)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestVehicule>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestVehicule[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getVehiculeIdentifier(vehicule: Pick<IVehicule, 'id'>): number {
    return vehicule.id;
  }

  compareVehicule(o1: Pick<IVehicule, 'id'> | null, o2: Pick<IVehicule, 'id'> | null): boolean {
    return o1 && o2 ? this.getVehiculeIdentifier(o1) === this.getVehiculeIdentifier(o2) : o1 === o2;
  }

  addVehiculeToCollectionIfMissing<Type extends Pick<IVehicule, 'id'>>(
    vehiculeCollection: Type[],
    ...vehiculesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const vehicules: Type[] = vehiculesToCheck.filter(isPresent);
    if (vehicules.length > 0) {
      const vehiculeCollectionIdentifiers = vehiculeCollection.map(vehiculeItem => this.getVehiculeIdentifier(vehiculeItem)!);
      const vehiculesToAdd = vehicules.filter(vehiculeItem => {
        const vehiculeIdentifier = this.getVehiculeIdentifier(vehiculeItem);
        if (vehiculeCollectionIdentifiers.includes(vehiculeIdentifier)) {
          return false;
        }
        vehiculeCollectionIdentifiers.push(vehiculeIdentifier);
        return true;
      });
      return [...vehiculesToAdd, ...vehiculeCollection];
    }
    return vehiculeCollection;
  }

  protected convertDateFromClient<T extends IVehicule | NewVehicule | PartialUpdateVehicule>(vehicule: T): RestOf<T> {
    return {
      ...vehicule,
      dateCirculation: vehicule.dateCirculation?.format(DATE_FORMAT) ?? null,
      createdAt: vehicule.createdAt?.toJSON() ?? null,
      updatedAt: vehicule.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restVehicule: RestVehicule): IVehicule {
    return {
      ...restVehicule,
      dateCirculation: restVehicule.dateCirculation ? dayjs(restVehicule.dateCirculation) : undefined,
      createdAt: restVehicule.createdAt ? dayjs(restVehicule.createdAt) : undefined,
      updatedAt: restVehicule.updatedAt ? dayjs(restVehicule.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestVehicule>): HttpResponse<IVehicule> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestVehicule[]>): HttpResponse<IVehicule[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
