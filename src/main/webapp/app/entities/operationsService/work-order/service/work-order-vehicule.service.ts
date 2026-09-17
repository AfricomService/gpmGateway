import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IWorkOrderVehicule } from '../work-order-vehicule.model';

export interface IVehiculeConflict {
  vehiculeId: number;
  workOrderId: number;
  numFicheIntervention?: string | null;
  identifiantUnique?: string | null;
  dateHeureFinPrev: string;
}

@Injectable({ providedIn: 'root' })
export class WorkOrderVehiculeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/work-order-vehicules', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  findByWorkOrder(workOrderId: number): Observable<HttpResponse<IWorkOrderVehicule[]>> {
    return this.http.get<IWorkOrderVehicule[]>(`${this.resourceUrl}/by-work-order/${workOrderId}`, {
      observe: 'response',
    });
  }

  replaceForWorkOrder(workOrderId: number, vehiculeIds: number[]): Observable<HttpResponse<IWorkOrderVehicule[]>> {
    return this.http.put<IWorkOrderVehicule[]>(`${this.resourceUrl}/by-work-order/${workOrderId}`, vehiculeIds, {
      observe: 'response',
    });
  }

  checkDisponibilite(vehiculeIds: number[], excludeWorkOrderId?: number | null): Observable<HttpResponse<IVehiculeConflict[]>> {
    let params = new HttpParams();
    vehiculeIds.forEach(id => (params = params.append('vehiculeIds', id.toString())));

    if (excludeWorkOrderId !== null && excludeWorkOrderId !== undefined) {
      params = params.set('excludeWorkOrderId', excludeWorkOrderId.toString());
    }

    return this.http.get<IVehiculeConflict[]>(`${this.resourceUrl}/check-disponibilite`, {
      params,
      observe: 'response',
    });
  }
}
