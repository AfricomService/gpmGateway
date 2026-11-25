import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { INoteFrais } from '../note-frais.model';
import { NoteFraisService } from '../service/note-frais.service';

@Injectable({ providedIn: 'root' })
export class NoteFraisRoutingResolveService implements Resolve<INoteFrais | null> {
  constructor(protected service: NoteFraisService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<INoteFrais | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((noteFrais: HttpResponse<INoteFrais>) => {
          if (noteFrais.body) {
            return of(noteFrais.body);
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
