import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IWorkOrder, NewWorkOrder } from '../work-order.model';

export type PartialUpdateWorkOrder = Partial<IWorkOrder> & Pick<IWorkOrder, 'id'>;

type RestOf<T extends IWorkOrder | NewWorkOrder> = Omit<
  T,
  'dateHeureDebutPrev' | 'dateHeureFinPrev' | 'dateHeureDebutReel' | 'dateHeureFinReel' | 'createdAt' | 'updatedAt'
> & {
  dateHeureDebutPrev?: string | null;
  dateHeureFinPrev?: string | null;
  dateHeureDebutReel?: string | null;
  dateHeureFinReel?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestWorkOrder = RestOf<IWorkOrder>;

export type NewRestWorkOrder = RestOf<NewWorkOrder>;

export type PartialUpdateRestWorkOrder = RestOf<PartialUpdateWorkOrder>;

export type EntityResponseType = HttpResponse<IWorkOrder>;
export type EntityArrayResponseType = HttpResponse<IWorkOrder[]>;

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/work-orders', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(workOrder: NewWorkOrder): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(workOrder);
    return this.http
      .post<RestWorkOrder>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(workOrder: IWorkOrder): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(workOrder);
    return this.http
      .put<RestWorkOrder>(`${this.resourceUrl}/${this.getWorkOrderIdentifier(workOrder)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(workOrder: PartialUpdateWorkOrder): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(workOrder);
    return this.http
      .patch<RestWorkOrder>(`${this.resourceUrl}/${this.getWorkOrderIdentifier(workOrder)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestWorkOrder>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestWorkOrder[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getWorkOrderIdentifier(workOrder: Pick<IWorkOrder, 'id'>): number {
    return workOrder.id;
  }

  compareWorkOrder(o1: Pick<IWorkOrder, 'id'> | null, o2: Pick<IWorkOrder, 'id'> | null): boolean {
    return o1 && o2 ? this.getWorkOrderIdentifier(o1) === this.getWorkOrderIdentifier(o2) : o1 === o2;
  }

  addWorkOrderToCollectionIfMissing<Type extends Pick<IWorkOrder, 'id'>>(
    workOrderCollection: Type[],
    ...workOrdersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const workOrders: Type[] = workOrdersToCheck.filter(isPresent);
    if (workOrders.length > 0) {
      const workOrderCollectionIdentifiers = workOrderCollection.map(workOrderItem => this.getWorkOrderIdentifier(workOrderItem)!);
      const workOrdersToAdd = workOrders.filter(workOrderItem => {
        const workOrderIdentifier = this.getWorkOrderIdentifier(workOrderItem);
        if (workOrderCollectionIdentifiers.includes(workOrderIdentifier)) {
          return false;
        }
        workOrderCollectionIdentifiers.push(workOrderIdentifier);
        return true;
      });
      return [...workOrdersToAdd, ...workOrderCollection];
    }
    return workOrderCollection;
  }

  protected convertDateFromClient<T extends IWorkOrder | NewWorkOrder | PartialUpdateWorkOrder>(workOrder: T): RestOf<T> {
    return {
      ...workOrder,
      dateHeureDebutPrev: workOrder.dateHeureDebutPrev?.toJSON() ?? null,
      dateHeureFinPrev: workOrder.dateHeureFinPrev?.toJSON() ?? null,
      dateHeureDebutReel: workOrder.dateHeureDebutReel?.toJSON() ?? null,
      dateHeureFinReel: workOrder.dateHeureFinReel?.toJSON() ?? null,
      createdAt: workOrder.createdAt?.toJSON() ?? null,
      updatedAt: workOrder.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restWorkOrder: RestWorkOrder): IWorkOrder {
    return {
      ...restWorkOrder,
      dateHeureDebutPrev: restWorkOrder.dateHeureDebutPrev ? dayjs(restWorkOrder.dateHeureDebutPrev) : undefined,
      dateHeureFinPrev: restWorkOrder.dateHeureFinPrev ? dayjs(restWorkOrder.dateHeureFinPrev) : undefined,
      dateHeureDebutReel: restWorkOrder.dateHeureDebutReel ? dayjs(restWorkOrder.dateHeureDebutReel) : undefined,
      dateHeureFinReel: restWorkOrder.dateHeureFinReel ? dayjs(restWorkOrder.dateHeureFinReel) : undefined,
      createdAt: restWorkOrder.createdAt ? dayjs(restWorkOrder.createdAt) : undefined,
      updatedAt: restWorkOrder.updatedAt ? dayjs(restWorkOrder.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestWorkOrder>): HttpResponse<IWorkOrder> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestWorkOrder[]>): HttpResponse<IWorkOrder[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
