import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IWoSite } from '../wo-site.model';
import { WoSiteService } from '../service/wo-site.service';

@Injectable({ providedIn: 'root' })
export class WoSiteRoutingResolveService implements Resolve<IWoSite | null> {
  constructor(protected service: WoSiteService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IWoSite | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((woSite: HttpResponse<IWoSite>) => {
          if (woSite.body) {
            return of(woSite.body);
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
