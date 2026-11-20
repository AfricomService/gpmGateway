import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IMissionLigne } from '../mission.model';

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
}
