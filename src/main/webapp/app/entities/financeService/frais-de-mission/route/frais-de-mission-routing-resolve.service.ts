import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFraisDeMission } from '../frais-de-mission.model';
import { FraisDeMissionService } from '../service/frais-de-mission.service';

@Injectable({ providedIn: 'root' })
export class FraisDeMissionRoutingResolveService implements Resolve<IFraisDeMission | null> {
  constructor(protected service: FraisDeMissionService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IFraisDeMission | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((fraisDeMission: HttpResponse<IFraisDeMission>) => {
          if (fraisDeMission.body) {
            return of(fraisDeMission.body);
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
