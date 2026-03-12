import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAffaire } from '../affaire.model';
import { AffaireService } from '../service/affaire.service';

@Injectable({ providedIn: 'root' })
export class AffaireRoutingResolveService implements Resolve<IAffaire | null> {
  constructor(protected service: AffaireService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAffaire | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((affaire: HttpResponse<IAffaire>) => {
          if (affaire.body) {
            return of(affaire.body);
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
