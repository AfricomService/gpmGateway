import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISST } from '../sst.model';
import { SSTService } from '../service/sst.service';

@Injectable({ providedIn: 'root' })
export class SSTRoutingResolveService implements Resolve<ISST | null> {
  constructor(protected service: SSTService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISST | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((sST: HttpResponse<ISST>) => {
          if (sST.body) {
            return of(sST.body);
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
