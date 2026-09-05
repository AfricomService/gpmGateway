import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPhaseOt } from '../phase-ot.model';
import { PhaseOtService } from '../service/phase-ot.service';

@Injectable({ providedIn: 'root' })
export class PhaseOtRoutingResolveService implements Resolve<IPhaseOt | null> {
  constructor(protected service: PhaseOtService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IPhaseOt | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((phaseOt: HttpResponse<IPhaseOt>) => {
          if (phaseOt.body) {
            return of(phaseOt.body);
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
