import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IMatriceJourFerie } from '../matrice-jour-ferie.model';
import { MatriceJourFerieService } from '../service/matrice-jour-ferie.service';

@Injectable({ providedIn: 'root' })
export class MatriceJourFerieRoutingResolveService implements Resolve<IMatriceJourFerie | null> {
  constructor(protected service: MatriceJourFerieService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IMatriceJourFerie | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((matriceJourFerie: HttpResponse<IMatriceJourFerie>) => {
          if (matriceJourFerie.body) {
            return of(matriceJourFerie.body);
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
