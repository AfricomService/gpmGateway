import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IModelPhaseOT } from '../model-phase-ot.model';
import { ModelPhaseOTService } from '../service/model-phase-ot.service';

@Injectable({ providedIn: 'root' })
export class ModelPhaseOTRoutingResolveService implements Resolve<IModelPhaseOT | null> {
  constructor(protected service: ModelPhaseOTService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IModelPhaseOT | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((modelPhaseOT: HttpResponse<IModelPhaseOT>) => {
          if (modelPhaseOT.body) {
            return of(modelPhaseOT.body);
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
