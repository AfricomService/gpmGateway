import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IMotif } from '../motif.model';
import { MotifService } from '../service/motif.service';

@Injectable({ providedIn: 'root' })
export class MotifRoutingResolveService implements Resolve<IMotif | null> {
  constructor(protected service: MotifService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IMotif | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((motif: HttpResponse<IMotif>) => {
          if (motif.body) {
            return of(motif.body);
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
