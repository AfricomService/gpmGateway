import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { WoMotifFormService } from './wo-motif-form.service';
import { WoMotifService } from '../service/wo-motif.service';
import { IWoMotif } from '../wo-motif.model';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';
import { IMotif } from 'app/entities/operationsService/motif/motif.model';
import { MotifService } from 'app/entities/operationsService/motif/service/motif.service';

import { WoMotifUpdateComponent } from './wo-motif-update.component';

describe('WoMotif Management Update Component', () => {
  let comp: WoMotifUpdateComponent;
  let fixture: ComponentFixture<WoMotifUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let woMotifFormService: WoMotifFormService;
  let woMotifService: WoMotifService;
  let workOrderService: WorkOrderService;
  let motifService: MotifService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [WoMotifUpdateComponent],
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
      .overrideTemplate(WoMotifUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(WoMotifUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    woMotifFormService = TestBed.inject(WoMotifFormService);
    woMotifService = TestBed.inject(WoMotifService);
    workOrderService = TestBed.inject(WorkOrderService);
    motifService = TestBed.inject(MotifService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call WorkOrder query and add missing value', () => {
      const woMotif: IWoMotif = { id: 456 };
      const workOrder: IWorkOrder = { id: 88932 };
      woMotif.workOrder = workOrder;

      const workOrderCollection: IWorkOrder[] = [{ id: 48562 }];
      jest.spyOn(workOrderService, 'query').mockReturnValue(of(new HttpResponse({ body: workOrderCollection })));
      const additionalWorkOrders = [workOrder];
      const expectedCollection: IWorkOrder[] = [...additionalWorkOrders, ...workOrderCollection];
      jest.spyOn(workOrderService, 'addWorkOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ woMotif });
      comp.ngOnInit();

      expect(workOrderService.query).toHaveBeenCalled();
      expect(workOrderService.addWorkOrderToCollectionIfMissing).toHaveBeenCalledWith(
        workOrderCollection,
        ...additionalWorkOrders.map(expect.objectContaining)
      );
      expect(comp.workOrdersSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Motif query and add missing value', () => {
      const woMotif: IWoMotif = { id: 456 };
      const motif: IMotif = { id: 29247 };
      woMotif.motif = motif;

      const motifCollection: IMotif[] = [{ id: 55794 }];
      jest.spyOn(motifService, 'query').mockReturnValue(of(new HttpResponse({ body: motifCollection })));
      const additionalMotifs = [motif];
      const expectedCollection: IMotif[] = [...additionalMotifs, ...motifCollection];
      jest.spyOn(motifService, 'addMotifToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ woMotif });
      comp.ngOnInit();

      expect(motifService.query).toHaveBeenCalled();
      expect(motifService.addMotifToCollectionIfMissing).toHaveBeenCalledWith(
        motifCollection,
        ...additionalMotifs.map(expect.objectContaining)
      );
      expect(comp.motifsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const woMotif: IWoMotif = { id: 456 };
      const workOrder: IWorkOrder = { id: 2779 };
      woMotif.workOrder = workOrder;
      const motif: IMotif = { id: 23073 };
      woMotif.motif = motif;

      activatedRoute.data = of({ woMotif });
      comp.ngOnInit();

      expect(comp.workOrdersSharedCollection).toContain(workOrder);
      expect(comp.motifsSharedCollection).toContain(motif);
      expect(comp.woMotif).toEqual(woMotif);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoMotif>>();
      const woMotif = { id: 123 };
      jest.spyOn(woMotifFormService, 'getWoMotif').mockReturnValue(woMotif);
      jest.spyOn(woMotifService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woMotif });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: woMotif }));
      saveSubject.complete();

      // THEN
      expect(woMotifFormService.getWoMotif).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(woMotifService.update).toHaveBeenCalledWith(expect.objectContaining(woMotif));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoMotif>>();
      const woMotif = { id: 123 };
      jest.spyOn(woMotifFormService, 'getWoMotif').mockReturnValue({ id: null });
      jest.spyOn(woMotifService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woMotif: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: woMotif }));
      saveSubject.complete();

      // THEN
      expect(woMotifFormService.getWoMotif).toHaveBeenCalled();
      expect(woMotifService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoMotif>>();
      const woMotif = { id: 123 };
      jest.spyOn(woMotifService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woMotif });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(woMotifService.update).toHaveBeenCalled();
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

    describe('compareMotif', () => {
      it('Should forward to motifService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(motifService, 'compareMotif');
        comp.compareMotif(entity, entity2);
        expect(motifService.compareMotif).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
