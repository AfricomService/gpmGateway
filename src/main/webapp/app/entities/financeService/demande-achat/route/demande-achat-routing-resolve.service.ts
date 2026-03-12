import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IDemandeAchat } from '../demande-achat.model';
import { DemandeAchatService } from '../service/demande-achat.service';

@Injectable({ providedIn: 'root' })
export class DemandeAchatRoutingResolveService implements Resolve<IDemandeAchat | null> {
  constructor(protected service: DemandeAchatService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IDemandeAchat | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((demandeAchat: HttpResponse<IDemandeAchat>) => {
          if (demandeAchat.body) {
            return of(demandeAchat.body);
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
