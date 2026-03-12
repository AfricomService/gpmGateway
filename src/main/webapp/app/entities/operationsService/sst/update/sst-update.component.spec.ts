import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { SSTFormService } from './sst-form.service';
import { SSTService } from '../service/sst.service';
import { ISST } from '../sst.model';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

import { SSTUpdateComponent } from './sst-update.component';

describe('SST Management Update Component', () => {
  let comp: SSTUpdateComponent;
  let fixture: ComponentFixture<SSTUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let sSTFormService: SSTFormService;
  let sSTService: SSTService;
  let workOrderService: WorkOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [SSTUpdateComponent],
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
      .overrideTemplate(SSTUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SSTUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    sSTFormService = TestBed.inject(SSTFormService);
    sSTService = TestBed.inject(SSTService);
    workOrderService = TestBed.inject(WorkOrderService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call WorkOrder query and add missing value', () => {
      const sST: ISST = { id: 456 };
      const workOrder: IWorkOrder = { id: 57376 };
      sST.workOrder = workOrder;

      const workOrderCollection: IWorkOrder[] = [{ id: 84945 }];
      jest.spyOn(workOrderService, 'query').mockReturnValue(of(new HttpResponse({ body: workOrderCollection })));
      const additionalWorkOrders = [workOrder];
      const expectedCollection: IWorkOrder[] = [...additionalWorkOrders, ...workOrderCollection];
      jest.spyOn(workOrderService, 'addWorkOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ sST });
      comp.ngOnInit();

      expect(workOrderService.query).toHaveBeenCalled();
      expect(workOrderService.addWorkOrderToCollectionIfMissing).toHaveBeenCalledWith(
        workOrderCollection,
        ...additionalWorkOrders.map(expect.objectContaining)
      );
      expect(comp.workOrdersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const sST: ISST = { id: 456 };
      const workOrder: IWorkOrder = { id: 58797 };
      sST.workOrder = workOrder;

      activatedRoute.data = of({ sST });
      comp.ngOnInit();

      expect(comp.workOrdersSharedCollection).toContain(workOrder);
      expect(comp.sST).toEqual(sST);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISST>>();
      const sST = { id: 123 };
      jest.spyOn(sSTFormService, 'getSST').mockReturnValue(sST);
      jest.spyOn(sSTService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ sST });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: sST }));
      saveSubject.complete();

      // THEN
      expect(sSTFormService.getSST).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(sSTService.update).toHaveBeenCalledWith(expect.objectContaining(sST));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISST>>();
      const sST = { id: 123 };
      jest.spyOn(sSTFormService, 'getSST').mockReturnValue({ id: null });
      jest.spyOn(sSTService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ sST: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: sST }));
      saveSubject.complete();

      // THEN
      expect(sSTFormService.getSST).toHaveBeenCalled();
      expect(sSTService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISST>>();
      const sST = { id: 123 };
      jest.spyOn(sSTService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ sST });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(sSTService.update).toHaveBeenCalled();
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
