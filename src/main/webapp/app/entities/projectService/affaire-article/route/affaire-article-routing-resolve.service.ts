import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAffaireArticle } from '../affaire-article.model';
import { AffaireArticleService } from '../service/affaire-article.service';

@Injectable({ providedIn: 'root' })
export class AffaireArticleRoutingResolveService implements Resolve<IAffaireArticle | null> {
  constructor(protected service: AffaireArticleService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAffaireArticle | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((affaireArticle: HttpResponse<IAffaireArticle>) => {
          if (affaireArticle.body) {
            return of(affaireArticle.body);
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
