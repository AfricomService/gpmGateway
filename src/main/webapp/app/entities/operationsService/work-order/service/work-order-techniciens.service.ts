import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IWorkOrderTechniciens } from '../work-order-techniciens.model';

export interface ITechnicienConflict {
  contactSocieteId: number;
  workOrderId: number;
  numFicheIntervention?: string | null;
  identifiantUnique?: string | null;
  dateHeureFinPrev: string;
}

@Injectable({ providedIn: 'root' })
export class WorkOrderTechniciensService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/work-order-techniciens', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  findByWorkOrder(workOrderId: number): Observable<HttpResponse<IWorkOrderTechniciens[]>> {
    return this.http.get<IWorkOrderTechniciens[]>(`${this.resourceUrl}/by-work-order/${workOrderId}`, {
      observe: 'response',
    });
  }

  replaceForWorkOrder(workOrderId: number, contactSocieteIds: number[]): Observable<HttpResponse<IWorkOrderTechniciens[]>> {
    return this.http.put<IWorkOrderTechniciens[]>(`${this.resourceUrl}/by-work-order/${workOrderId}`, contactSocieteIds, {
      observe: 'response',
    });
  }

  checkDisponibilite(contactSocieteIds: number[], excludeWorkOrderId?: number | null): Observable<HttpResponse<ITechnicienConflict[]>> {
    let params = new HttpParams();
    contactSocieteIds.forEach(id => (params = params.append('contactSocieteIds', id.toString())));

    if (excludeWorkOrderId !== null && excludeWorkOrderId !== undefined) {
      params = params.set('excludeWorkOrderId', excludeWorkOrderId.toString());
    }

    return this.http.get<ITechnicienConflict[]>(`${this.resourceUrl}/check-disponibilite`, {
      params,
      observe: 'response',
    });
  }
}
