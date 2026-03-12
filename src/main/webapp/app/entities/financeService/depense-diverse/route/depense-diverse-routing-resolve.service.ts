import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IDepenseDiverse } from '../depense-diverse.model';
import { DepenseDiverseService } from '../service/depense-diverse.service';

@Injectable({ providedIn: 'root' })
export class DepenseDiverseRoutingResolveService implements Resolve<IDepenseDiverse | null> {
  constructor(protected service: DepenseDiverseService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IDepenseDiverse | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((depenseDiverse: HttpResponse<IDepenseDiverse>) => {
          if (depenseDiverse.body) {
            return of(depenseDiverse.body);
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
