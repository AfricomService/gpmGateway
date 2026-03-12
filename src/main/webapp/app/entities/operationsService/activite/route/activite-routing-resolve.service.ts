import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IActivite } from '../activite.model';
import { ActiviteService } from '../service/activite.service';

@Injectable({ providedIn: 'root' })
export class ActiviteRoutingResolveService implements Resolve<IActivite | null> {
  constructor(protected service: ActiviteService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IActivite | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((activite: HttpResponse<IActivite>) => {
          if (activite.body) {
            return of(activite.body);
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
