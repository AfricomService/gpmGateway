import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IWorkOrder } from '../work-order.model';
import { WorkOrderService } from '../service/work-order.service';

@Injectable({ providedIn: 'root' })
export class WorkOrderRoutingResolveService implements Resolve<IWorkOrder | null> {
  constructor(protected service: WorkOrderService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IWorkOrder | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((workOrder: HttpResponse<IWorkOrder>) => {
          if (workOrder.body) {
            return of(workOrder.body);
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
