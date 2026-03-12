import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IWoUtilisateur } from '../wo-utilisateur.model';
import { WoUtilisateurService } from '../service/wo-utilisateur.service';

@Injectable({ providedIn: 'root' })
export class WoUtilisateurRoutingResolveService implements Resolve<IWoUtilisateur | null> {
  constructor(protected service: WoUtilisateurService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IWoUtilisateur | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((woUtilisateur: HttpResponse<IWoUtilisateur>) => {
          if (woUtilisateur.body) {
            return of(woUtilisateur.body);
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
