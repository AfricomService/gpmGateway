import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IMatriceFacturation } from '../matrice-facturation.model';
import { MatriceFacturationService } from '../service/matrice-facturation.service';

@Injectable({ providedIn: 'root' })
export class MatriceFacturationRoutingResolveService implements Resolve<IMatriceFacturation | null> {
  constructor(protected service: MatriceFacturationService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IMatriceFacturation | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((matriceFacturation: HttpResponse<IMatriceFacturation>) => {
          if (matriceFacturation.body) {
            return of(matriceFacturation.body);
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
