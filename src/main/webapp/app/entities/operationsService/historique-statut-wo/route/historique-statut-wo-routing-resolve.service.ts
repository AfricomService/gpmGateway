import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IHistoriqueStatutWO } from '../historique-statut-wo.model';
import { HistoriqueStatutWOService } from '../service/historique-statut-wo.service';

@Injectable({ providedIn: 'root' })
export class HistoriqueStatutWORoutingResolveService implements Resolve<IHistoriqueStatutWO | null> {
  constructor(protected service: HistoriqueStatutWOService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IHistoriqueStatutWO | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((historiqueStatutWO: HttpResponse<IHistoriqueStatutWO>) => {
          if (historiqueStatutWO.body) {
            return of(historiqueStatutWO.body);
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
