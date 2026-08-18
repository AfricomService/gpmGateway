import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IRessource } from '../ressource.model';
import { RessourceService } from '../service/ressource.service';

@Injectable({ providedIn: 'root' })
export class RessourceRoutingResolveService implements Resolve<IRessource | null> {
  constructor(protected service: RessourceService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IRessource | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((ressource: HttpResponse<IRessource>) => {
          if (ressource.body) {
            return of(ressource.body);
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
