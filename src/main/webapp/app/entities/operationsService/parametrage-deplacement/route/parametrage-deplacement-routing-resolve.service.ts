import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IParametrageDeplacement } from '../parametrage-deplacement.model';
import { ParametrageDeplacementService } from '../service/parametrage-deplacement.service';

@Injectable({ providedIn: 'root' })
export class ParametrageDeplacementRoutingResolveService implements Resolve<IParametrageDeplacement | null> {
  constructor(protected service: ParametrageDeplacementService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IParametrageDeplacement | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((parametrageDeplacement: HttpResponse<IParametrageDeplacement>) => {
          if (parametrageDeplacement.body) {
            return of(parametrageDeplacement.body);
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
