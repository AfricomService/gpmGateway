import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITypeRessource } from '../type-ressource.model';
import { TypeRessourceService } from '../service/type-ressource.service';

@Injectable({ providedIn: 'root' })
export class TypeRessourceRoutingResolveService implements Resolve<ITypeRessource | null> {
  constructor(protected service: TypeRessourceService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ITypeRessource | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((typeRessource: HttpResponse<ITypeRessource>) => {
          if (typeRessource.body) {
            return of(typeRessource.body);
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
