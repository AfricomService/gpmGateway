import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface IRapportTemplate {
  id: number;
  name?: string | null;
  description?: string | null;
  actif?: boolean | null;
}

export interface IRapportTemplatesUpdate {
  rapportTemplateIds: number[];
}

@Injectable({ providedIn: 'root' })
export class AffaireRapportTemplateService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/affaires', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  /** Liste complète des templates (proxy report-api via project-service). */
  getAllTemplates(): Observable<IRapportTemplate[]> {
    return this.http.get<IRapportTemplate[]>(`${this.resourceUrl}/rapport-templates`);
  }

  /** IDs des templates déjà associés à l'affaire. */
  getAssignedTemplateIds(affaireId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.resourceUrl}/${affaireId}/rapport-templates`);
  }

  /** Remplace la sélection (full replace, comme les sociétés associées). */
  setAssignedTemplateIds(affaireId: number, rapportTemplateIds: number[]): Observable<void> {
    const body: IRapportTemplatesUpdate = { rapportTemplateIds };
    return this.http.put<void>(`${this.resourceUrl}/${affaireId}/rapport-templates`, body);
  }
}
