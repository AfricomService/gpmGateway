import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFactureWO } from '../facture-wo.model';
import { FactureWOService } from '../service/facture-wo.service';

@Injectable({ providedIn: 'root' })
export class FactureWORoutingResolveService implements Resolve<IFactureWO | null> {
  constructor(protected service: FactureWOService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IFactureWO | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((factureWO: HttpResponse<IFactureWO>) => {
          if (factureWO.body) {
            return of(factureWO.body);
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
