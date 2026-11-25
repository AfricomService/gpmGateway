import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IMission, IMissionLigne } from '../mission.model';

export type EntityArrayResponseType = HttpResponse<IMissionLigne[]>;

@Injectable({ providedIn: 'root' })
export class MissionService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/missions', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  /** Missions dont le work order a dateHeureDebutReel dans [debut, fin] (dates ISO). */
  findByPeriode(debut: string, fin: string, contactSocieteId?: number | null): Observable<EntityArrayResponseType> {
    let params = new HttpParams().set('debut', debut).set('fin', fin);

    if (contactSocieteId !== null && contactSocieteId !== undefined) {
      params = params.set('contactSocieteId', contactSocieteId);
    }

    return this.http.get<IMissionLigne[]>(`${this.resourceUrl}/search`, { params, observe: 'response' });
  }

  /** Missions d'un work order (GET /missions?workorderId.equals=...). */
  findByWorkOrder(workOrderId: number): Observable<HttpResponse<IMission[]>> {
    const params = new HttpParams().set('workorderId.equals', workOrderId).set('size', 1000);
    return this.http.get<IMission[]>(this.resourceUrl, { params, observe: 'response' });
  }

  /** Met à jour uniquement la note d'une mission (PATCH /missions/{id}). */
  updateNote(id: number, noteMission: number): Observable<HttpResponse<IMission>> {
    return this.http.patch<IMission>(`${this.resourceUrl}/${id}`, { id, noteMission }, { observe: 'response' });
  }
}
