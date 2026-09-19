import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface IWorkOrderRessource {
  id?: number;
  workOrderId?: number;
  ressourceId?: number;
}

export interface IRessourceConflict {
  ressourceId: number;
  workOrderId: number;
  numFicheIntervention?: string | null;
  identifiantUnique?: string | null;
  dateHeureFinPrev?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WorkOrderRessourceService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/work-order-ressources', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  findByWorkOrder(workOrderId: number): Observable<HttpResponse<IWorkOrderRessource[]>> {
    return this.http.get<IWorkOrderRessource[]>(`${this.resourceUrl}/by-work-order/${workOrderId}`, { observe: 'response' });
  }

  checkDisponibilite(ressourceIds: number[], excludeWorkOrderId: number | null): Observable<HttpResponse<IRessourceConflict[]>> {
    let params = new HttpParams();
    ressourceIds.forEach(id => {
      params = params.append('ressourceIds', id.toString());
    });
    if (excludeWorkOrderId !== null && excludeWorkOrderId !== undefined) {
      params = params.set('excludeWorkOrderId', excludeWorkOrderId.toString());
    }

    return this.http.get<IRessourceConflict[]>(`${this.resourceUrl}/check-disponibilite`, { params, observe: 'response' });
  }

  replaceForWorkOrder(workOrderId: number, ressourceIds: number[]): Observable<HttpResponse<IWorkOrderRessource[]>> {
    return this.http.put<IWorkOrderRessource[]>(`${this.resourceUrl}/by-work-order/${workOrderId}`, ressourceIds, {
      observe: 'response',
    });
  }
}
