import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { IParametrageDeplacement } from '../parametrage-deplacement.model';
import { ParametrageDeplacementService } from '../service/parametrage-deplacement.service';

import { ParametrageDeplacementRoutingResolveService } from './parametrage-deplacement-routing-resolve.service';

describe('ParametrageDeplacement routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: ParametrageDeplacementRoutingResolveService;
  let service: ParametrageDeplacementService;
  let resultParametrageDeplacement: IParametrageDeplacement | null | undefined;

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
    routingResolveService = TestBed.inject(ParametrageDeplacementRoutingResolveService);
    service = TestBed.inject(ParametrageDeplacementService);
    resultParametrageDeplacement = undefined;
  });

  describe('resolve', () => {
    it('should return IParametrageDeplacement returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultParametrageDeplacement = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultParametrageDeplacement).toEqual({ id: 123 });
    });

    it('should return null if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultParametrageDeplacement = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultParametrageDeplacement).toEqual(null);
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse<IParametrageDeplacement>({ body: null })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultParametrageDeplacement = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultParametrageDeplacement).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
