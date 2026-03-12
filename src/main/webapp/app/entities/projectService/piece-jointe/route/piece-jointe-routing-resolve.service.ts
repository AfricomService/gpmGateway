import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPieceJointe } from '../piece-jointe.model';
import { PieceJointeService } from '../service/piece-jointe.service';

@Injectable({ providedIn: 'root' })
export class PieceJointeRoutingResolveService implements Resolve<IPieceJointe | null> {
  constructor(protected service: PieceJointeService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IPieceJointe | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((pieceJointe: HttpResponse<IPieceJointe>) => {
          if (pieceJointe.body) {
            return of(pieceJointe.body);
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
