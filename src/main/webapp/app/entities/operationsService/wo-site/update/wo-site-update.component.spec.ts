import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { WoSiteFormService } from './wo-site-form.service';
import { WoSiteService } from '../service/wo-site.service';
import { IWoSite } from '../wo-site.model';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

import { WoSiteUpdateComponent } from './wo-site-update.component';

describe('WoSite Management Update Component', () => {
  let comp: WoSiteUpdateComponent;
  let fixture: ComponentFixture<WoSiteUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let woSiteFormService: WoSiteFormService;
  let woSiteService: WoSiteService;
  let workOrderService: WorkOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [WoSiteUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(WoSiteUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(WoSiteUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    woSiteFormService = TestBed.inject(WoSiteFormService);
    woSiteService = TestBed.inject(WoSiteService);
    workOrderService = TestBed.inject(WorkOrderService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call WorkOrder query and add missing value', () => {
      const woSite: IWoSite = { id: 456 };
      const workOrder: IWorkOrder = { id: 97620 };
      woSite.workOrder = workOrder;

      const workOrderCollection: IWorkOrder[] = [{ id: 74437 }];
      jest.spyOn(workOrderService, 'query').mockReturnValue(of(new HttpResponse({ body: workOrderCollection })));
      const additionalWorkOrders = [workOrder];
      const expectedCollection: IWorkOrder[] = [...additionalWorkOrders, ...workOrderCollection];
      jest.spyOn(workOrderService, 'addWorkOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ woSite });
      comp.ngOnInit();

      expect(workOrderService.query).toHaveBeenCalled();
      expect(workOrderService.addWorkOrderToCollectionIfMissing).toHaveBeenCalledWith(
        workOrderCollection,
        ...additionalWorkOrders.map(expect.objectContaining)
      );
      expect(comp.workOrdersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const woSite: IWoSite = { id: 456 };
      const workOrder: IWorkOrder = { id: 86079 };
      woSite.workOrder = workOrder;

      activatedRoute.data = of({ woSite });
      comp.ngOnInit();

      expect(comp.workOrdersSharedCollection).toContain(workOrder);
      expect(comp.woSite).toEqual(woSite);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoSite>>();
      const woSite = { id: 123 };
      jest.spyOn(woSiteFormService, 'getWoSite').mockReturnValue(woSite);
      jest.spyOn(woSiteService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woSite });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: woSite }));
      saveSubject.complete();

      // THEN
      expect(woSiteFormService.getWoSite).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(woSiteService.update).toHaveBeenCalledWith(expect.objectContaining(woSite));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoSite>>();
      const woSite = { id: 123 };
      jest.spyOn(woSiteFormService, 'getWoSite').mockReturnValue({ id: null });
      jest.spyOn(woSiteService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woSite: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: woSite }));
      saveSubject.complete();

      // THEN
      expect(woSiteFormService.getWoSite).toHaveBeenCalled();
      expect(woSiteService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoSite>>();
      const woSite = { id: 123 };
      jest.spyOn(woSiteService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woSite });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(woSiteService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareWorkOrder', () => {
      it('Should forward to workOrderService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(workOrderService, 'compareWorkOrder');
        comp.compareWorkOrder(entity, entity2);
        expect(workOrderService.compareWorkOrder).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
