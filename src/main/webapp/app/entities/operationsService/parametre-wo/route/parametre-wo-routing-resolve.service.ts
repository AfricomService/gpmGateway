import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IParametreWO } from '../parametre-wo.model';
import { ParametreWOService } from '../service/parametre-wo.service';

@Injectable({ providedIn: 'root' })
export class ParametreWORoutingResolveService implements Resolve<IParametreWO | null> {
  constructor(protected service: ParametreWOService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IParametreWO | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((parametreWO: HttpResponse<IParametreWO>) => {
          if (parametreWO.body) {
            return of(parametreWO.body);
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
