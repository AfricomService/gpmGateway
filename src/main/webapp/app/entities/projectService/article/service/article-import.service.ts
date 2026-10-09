import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface IArticleImportResult {
  successCount: number;
  errors: string[];
}

export interface IArticleImportRowResult {
  row: number; // Excel row number (header = 1)
  success: boolean;
  message?: string;
}

export interface IArticleImportResult {
  successCount: number;
  errors: string[];
  rowResults?: IArticleImportRowResult[];
}

@Injectable({ providedIn: 'root' })
export class ArticleImportService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/articles/import', 'projectservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  importArticles(affaireId: number, file: File): Observable<HttpResponse<IArticleImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<IArticleImportResult>(`${this.resourceUrl}/${affaireId}`, formData, { observe: 'response' });
  }

  downloadTemplate(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.resourceUrl}/template`, { observe: 'response', responseType: 'blob' });
  }
}
