import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IDevis } from '../devis.model';
import { DevisService } from '../service/devis.service';

@Injectable({ providedIn: 'root' })
export class DevisRoutingResolveService implements Resolve<IDevis | null> {
  constructor(protected service: DevisService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IDevis | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((devis: HttpResponse<IDevis>) => {
          if (devis.body) {
            return of(devis.body);
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
