import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IArticleMission, NewArticleMission } from '../article-mission.model';

export type PartialUpdateArticleMission = Partial<IArticleMission> & Pick<IArticleMission, 'id'>;

export type EntityResponseType = HttpResponse<IArticleMission>;
export type EntityArrayResponseType = HttpResponse<IArticleMission[]>;

@Injectable({ providedIn: 'root' })
export class ArticleMissionService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/article-missions', 'operationsservice');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(articleMission: NewArticleMission): Observable<EntityResponseType> {
    return this.http.post<IArticleMission>(this.resourceUrl, articleMission, { observe: 'response' });
  }

  update(articleMission: IArticleMission): Observable<EntityResponseType> {
    return this.http.put<IArticleMission>(`${this.resourceUrl}/${this.getArticleMissionIdentifier(articleMission)}`, articleMission, {
      observe: 'response',
    });
  }

  partialUpdate(articleMission: PartialUpdateArticleMission): Observable<EntityResponseType> {
    return this.http.patch<IArticleMission>(`${this.resourceUrl}/${this.getArticleMissionIdentifier(articleMission)}`, articleMission, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IArticleMission>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IArticleMission[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getArticleMissionIdentifier(articleMission: Pick<IArticleMission, 'id'>): number {
    return articleMission.id;
  }

  compareArticleMission(o1: Pick<IArticleMission, 'id'> | null, o2: Pick<IArticleMission, 'id'> | null): boolean {
    return o1 && o2 ? this.getArticleMissionIdentifier(o1) === this.getArticleMissionIdentifier(o2) : o1 === o2;
  }

  addArticleMissionToCollectionIfMissing<Type extends Pick<IArticleMission, 'id'>>(
    articleMissionCollection: Type[],
    ...articleMissionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const articleMissions: Type[] = articleMissionsToCheck.filter(isPresent);
    if (articleMissions.length > 0) {
      const articleMissionCollectionIdentifiers = articleMissionCollection.map(
        articleMissionItem => this.getArticleMissionIdentifier(articleMissionItem)!
      );
      const articleMissionsToAdd = articleMissions.filter(articleMissionItem => {
        const articleMissionIdentifier = this.getArticleMissionIdentifier(articleMissionItem);
        if (articleMissionCollectionIdentifiers.includes(articleMissionIdentifier)) {
          return false;
        }
        articleMissionCollectionIdentifiers.push(articleMissionIdentifier);
        return true;
      });
      return [...articleMissionsToAdd, ...articleMissionCollection];
    }
    return articleMissionCollection;
  }
}
