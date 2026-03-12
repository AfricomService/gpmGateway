import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { TacheFormService } from './tache-form.service';
import { TacheService } from '../service/tache.service';
import { ITache } from '../tache.model';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';
import { IActivite } from 'app/entities/operationsService/activite/activite.model';
import { ActiviteService } from 'app/entities/operationsService/activite/service/activite.service';

import { TacheUpdateComponent } from './tache-update.component';

describe('Tache Management Update Component', () => {
  let comp: TacheUpdateComponent;
  let fixture: ComponentFixture<TacheUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let tacheFormService: TacheFormService;
  let tacheService: TacheService;
  let workOrderService: WorkOrderService;
  let activiteService: ActiviteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [TacheUpdateComponent],
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
      .overrideTemplate(TacheUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TacheUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    tacheFormService = TestBed.inject(TacheFormService);
    tacheService = TestBed.inject(TacheService);
    workOrderService = TestBed.inject(WorkOrderService);
    activiteService = TestBed.inject(ActiviteService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call WorkOrder query and add missing value', () => {
      const tache: ITache = { id: 456 };
      const workOrder: IWorkOrder = { id: 90003 };
      tache.workOrder = workOrder;

      const workOrderCollection: IWorkOrder[] = [{ id: 63612 }];
      jest.spyOn(workOrderService, 'query').mockReturnValue(of(new HttpResponse({ body: workOrderCollection })));
      const additionalWorkOrders = [workOrder];
      const expectedCollection: IWorkOrder[] = [...additionalWorkOrders, ...workOrderCollection];
      jest.spyOn(workOrderService, 'addWorkOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ tache });
      comp.ngOnInit();

      expect(workOrderService.query).toHaveBeenCalled();
      expect(workOrderService.addWorkOrderToCollectionIfMissing).toHaveBeenCalledWith(
        workOrderCollection,
        ...additionalWorkOrders.map(expect.objectContaining)
      );
      expect(comp.workOrdersSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Activite query and add missing value', () => {
      const tache: ITache = { id: 456 };
      const activite: IActivite = { id: 8953 };
      tache.activite = activite;

      const activiteCollection: IActivite[] = [{ id: 95628 }];
      jest.spyOn(activiteService, 'query').mockReturnValue(of(new HttpResponse({ body: activiteCollection })));
      const additionalActivites = [activite];
      const expectedCollection: IActivite[] = [...additionalActivites, ...activiteCollection];
      jest.spyOn(activiteService, 'addActiviteToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ tache });
      comp.ngOnInit();

      expect(activiteService.query).toHaveBeenCalled();
      expect(activiteService.addActiviteToCollectionIfMissing).toHaveBeenCalledWith(
        activiteCollection,
        ...additionalActivites.map(expect.objectContaining)
      );
      expect(comp.activitesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const tache: ITache = { id: 456 };
      const workOrder: IWorkOrder = { id: 9881 };
      tache.workOrder = workOrder;
      const activite: IActivite = { id: 38319 };
      tache.activite = activite;

      activatedRoute.data = of({ tache });
      comp.ngOnInit();

      expect(comp.workOrdersSharedCollection).toContain(workOrder);
      expect(comp.activitesSharedCollection).toContain(activite);
      expect(comp.tache).toEqual(tache);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITache>>();
      const tache = { id: 123 };
      jest.spyOn(tacheFormService, 'getTache').mockReturnValue(tache);
      jest.spyOn(tacheService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tache });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tache }));
      saveSubject.complete();

      // THEN
      expect(tacheFormService.getTache).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(tacheService.update).toHaveBeenCalledWith(expect.objectContaining(tache));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITache>>();
      const tache = { id: 123 };
      jest.spyOn(tacheFormService, 'getTache').mockReturnValue({ id: null });
      jest.spyOn(tacheService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tache: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tache }));
      saveSubject.complete();

      // THEN
      expect(tacheFormService.getTache).toHaveBeenCalled();
      expect(tacheService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITache>>();
      const tache = { id: 123 };
      jest.spyOn(tacheService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tache });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(tacheService.update).toHaveBeenCalled();
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

    describe('compareActivite', () => {
      it('Should forward to activiteService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(activiteService, 'compareActivite');
        comp.compareActivite(entity, entity2);
        expect(activiteService.compareActivite).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
