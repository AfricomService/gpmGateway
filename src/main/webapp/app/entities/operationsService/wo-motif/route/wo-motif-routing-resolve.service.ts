import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IWoMotif } from '../wo-motif.model';
import { WoMotifService } from '../service/wo-motif.service';

@Injectable({ providedIn: 'root' })
export class WoMotifRoutingResolveService implements Resolve<IWoMotif | null> {
  constructor(protected service: WoMotifService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IWoMotif | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((woMotif: HttpResponse<IWoMotif>) => {
          if (woMotif.body) {
            return of(woMotif.body);
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
