import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { IArticleDemandeAchat } from '../article-demande-achat.model';
import { ArticleDemandeAchatService } from '../service/article-demande-achat.service';

import { ArticleDemandeAchatRoutingResolveService } from './article-demande-achat-routing-resolve.service';

describe('ArticleDemandeAchat routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: ArticleDemandeAchatRoutingResolveService;
  let service: ArticleDemandeAchatService;
  let resultArticleDemandeAchat: IArticleDemandeAchat | null | undefined;

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
    routingResolveService = TestBed.inject(ArticleDemandeAchatRoutingResolveService);
    service = TestBed.inject(ArticleDemandeAchatService);
    resultArticleDemandeAchat = undefined;
  });

  describe('resolve', () => {
    it('should return IArticleDemandeAchat returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultArticleDemandeAchat = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultArticleDemandeAchat).toEqual({ id: 123 });
    });

    it('should return null if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultArticleDemandeAchat = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultArticleDemandeAchat).toEqual(null);
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse<IArticleDemandeAchat>({ body: null })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultArticleDemandeAchat = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultArticleDemandeAchat).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
