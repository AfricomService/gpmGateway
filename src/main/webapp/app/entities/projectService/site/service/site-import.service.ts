import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface ISiteImportResult {
  successCount: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class SiteImportService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sites/import', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  importSites(clientId: number, file: File): Observable<HttpResponse<ISiteImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ISiteImportResult>(`${this.resourceUrl}/${clientId}`, formData, { observe: 'response' });
  }

  downloadTemplate(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.resourceUrl}/template`, { observe: 'response', responseType: 'blob' });
  }
}
