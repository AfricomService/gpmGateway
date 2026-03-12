import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { IHistoriqueStatutWO } from '../historique-statut-wo.model';
import { HistoriqueStatutWOService } from '../service/historique-statut-wo.service';

import { HistoriqueStatutWORoutingResolveService } from './historique-statut-wo-routing-resolve.service';

describe('HistoriqueStatutWO routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: HistoriqueStatutWORoutingResolveService;
  let service: HistoriqueStatutWOService;
  let resultHistoriqueStatutWO: IHistoriqueStatutWO | null | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
    mockRouter = TestBed.inject(Router);
    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRoute).snapshot;
    routingResolveService = TestBed.inject(HistoriqueStatutWORoutingResolveService);
    service = TestBed.inject(HistoriqueStatutWOService);
    resultHistoriqueStatutWO = undefined;
  });

  describe('resolve', () => {
    it('should return IHistoriqueStatutWO returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultHistoriqueStatutWO = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultHistoriqueStatutWO).toEqual({ id: 123 });
    });

    it('should return null if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultHistoriqueStatutWO = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultHistoriqueStatutWO).toEqual(null);
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse<IHistoriqueStatutWO>({ body: null })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultHistoriqueStatutWO = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultHistoriqueStatutWO).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
