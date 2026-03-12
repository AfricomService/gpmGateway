import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IArticleDemandeAchat } from '../article-demande-achat.model';
import { ArticleDemandeAchatService } from '../service/article-demande-achat.service';

@Injectable({ providedIn: 'root' })
export class ArticleDemandeAchatRoutingResolveService implements Resolve<IArticleDemandeAchat | null> {
  constructor(protected service: ArticleDemandeAchatService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IArticleDemandeAchat | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((articleDemandeAchat: HttpResponse<IArticleDemandeAchat>) => {
          if (articleDemandeAchat.body) {
            return of(articleDemandeAchat.body);
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
