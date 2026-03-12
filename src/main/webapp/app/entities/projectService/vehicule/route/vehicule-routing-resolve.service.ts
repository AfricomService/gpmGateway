import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IVehicule } from '../vehicule.model';
import { VehiculeService } from '../service/vehicule.service';

@Injectable({ providedIn: 'root' })
export class VehiculeRoutingResolveService implements Resolve<IVehicule | null> {
  constructor(protected service: VehiculeService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IVehicule | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((vehicule: HttpResponse<IVehicule>) => {
          if (vehicule.body) {
            return of(vehicule.body);
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
