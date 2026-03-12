import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IOtExterne } from '../ot-externe.model';
import { OtExterneService } from '../service/ot-externe.service';

@Injectable({ providedIn: 'root' })
export class OtExterneRoutingResolveService implements Resolve<IOtExterne | null> {
  constructor(protected service: OtExterneService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IOtExterne | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((otExterne: HttpResponse<IOtExterne>) => {
          if (otExterne.body) {
            return of(otExterne.body);
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
