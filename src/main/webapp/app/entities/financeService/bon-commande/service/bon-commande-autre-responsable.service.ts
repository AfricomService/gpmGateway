import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IBonCommandeAutreResponsable } from '../bon-commande-autre-responsable.model';

@Injectable({ providedIn: 'root' })
export class BonCommandeAutreResponsableService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/bon-commande-autre-responsables', 'financeservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  findByBonCommande(bonCommandeId: number): Observable<HttpResponse<IBonCommandeAutreResponsable[]>> {
    return this.http.get<IBonCommandeAutreResponsable[]>(`${this.resourceUrl}/by-bon-commande/${bonCommandeId}`, {
      observe: 'response',
    });
  }

  replaceForBonCommande(bonCommandeId: number, contactSocieteIds: number[]): Observable<HttpResponse<IBonCommandeAutreResponsable[]>> {
    return this.http.put<IBonCommandeAutreResponsable[]>(`${this.resourceUrl}/by-bon-commande/${bonCommandeId}`, contactSocieteIds, {
      observe: 'response',
    });
  }
}
