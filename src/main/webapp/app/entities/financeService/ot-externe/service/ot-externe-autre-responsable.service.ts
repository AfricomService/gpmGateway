import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IOtExterneAutreResponsable } from '../ot-externe-autre-responsable.model';

@Injectable({ providedIn: 'root' })
export class OtExterneAutreResponsableService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/ot-externe-autre-responsables', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  findByOtExterne(otExterneId: number): Observable<HttpResponse<IOtExterneAutreResponsable[]>> {
    return this.http.get<IOtExterneAutreResponsable[]>(`${this.resourceUrl}/by-ot-externe/${otExterneId}`, {
      observe: 'response',
    });
  }

  replaceForOtExterne(otExterneId: number, contactSocieteIds: number[]): Observable<HttpResponse<IOtExterneAutreResponsable[]>> {
    return this.http.put<IOtExterneAutreResponsable[]>(`${this.resourceUrl}/by-ot-externe/${otExterneId}`, contactSocieteIds, {
      observe: 'response',
    });
  }
}
