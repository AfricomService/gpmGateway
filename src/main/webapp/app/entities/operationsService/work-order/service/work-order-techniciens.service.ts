import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IWorkOrderTechniciens } from '../work-order-techniciens.model';

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
}
