import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IArticleMission } from '../article-mission.model';
import { ArticleMissionService } from '../service/article-mission.service';

@Injectable({ providedIn: 'root' })
export class ArticleMissionRoutingResolveService implements Resolve<IArticleMission | null> {
  constructor(protected service: ArticleMissionService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IArticleMission | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((articleMission: HttpResponse<IArticleMission>) => {
          if (articleMission.body) {
            return of(articleMission.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(null);
  }
}
