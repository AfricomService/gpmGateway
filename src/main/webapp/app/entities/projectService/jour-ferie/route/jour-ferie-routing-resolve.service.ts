import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IJourFerie } from '../jour-ferie.model';
import { JourFerieService } from '../service/jour-ferie.service';

@Injectable({ providedIn: 'root' })
export class JourFerieRoutingResolveService implements Resolve<IJourFerie | null> {
  constructor(protected service: JourFerieService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IJourFerie | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((jourFerie: HttpResponse<IJourFerie>) => {
          if (jourFerie.body) {
            return of(jourFerie.body);
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
