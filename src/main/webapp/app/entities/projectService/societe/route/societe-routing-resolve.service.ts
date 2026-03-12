import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISociete } from '../societe.model';
import { SocieteService } from '../service/societe.service';

@Injectable({ providedIn: 'root' })
export class SocieteRoutingResolveService implements Resolve<ISociete | null> {
  constructor(protected service: SocieteService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISociete | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((societe: HttpResponse<ISociete>) => {
          if (societe.body) {
            return of(societe.body);
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
