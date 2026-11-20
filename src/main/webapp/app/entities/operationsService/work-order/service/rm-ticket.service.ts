import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface IRmTemplate {
  id: number;
  name: string;
}

export interface IRmLineType {
  id: number;
  label: string;
}

export interface IRmFilesDefinition {
  id: number;
  label: string;
}

export interface IRmUser {
  id: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
}

export interface IRmTicketRequest {
  reference: string;
  clientFinal: string;
  technicianId: number;
  rapportTemplateId: number;
  lineTypeIds: number[];
  filesDefIds: number[];
}

export interface IRmTicketResponse {
  id?: number;
  reference?: string;
}

@Injectable({ providedIn: 'root' })
export class RmTicketService {
  // Microservice that hosts the TestController (adjust the service name if needed)
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/test', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  getTemplates(): Observable<IRmTemplate[]> {
    return this.http.get<IRmTemplate[]>(`${this.resourceUrl}/templates`);
  }

  getLineTypes(templateId: number): Observable<IRmLineType[]> {
    return this.http.get<IRmLineType[]>(`${this.resourceUrl}/line-types`, { params: { templateId } });
  }

  getFilesDefinitions(templateId: number): Observable<IRmFilesDefinition[]> {
    return this.http.get<IRmFilesDefinition[]>(`${this.resourceUrl}/files-definitions`, { params: { templateId } });
  }

  getUsers(): Observable<IRmUser[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/users`).pipe(
      map(users =>
        users.map(u => ({
          ...u,
          fullName: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.login || `#${u.id as number}`,
        }))
      )
    );
  }

  createTicket(req: IRmTicketRequest): Observable<IRmTicketResponse> {
    const params = new HttpParams()
      .set('reference', req.reference)
      .set('clientFinal', req.clientFinal)
      .set('technicianId', req.technicianId)
      .set('rapportTemplateId', req.rapportTemplateId)
      .set('lineTypeIds', req.lineTypeIds.join(','))
      .set('filesDefIds', req.filesDefIds.join(','));

    return this.http.post<IRmTicketResponse>(`${this.resourceUrl}/rapport-request`, null, { params });
  }
}
