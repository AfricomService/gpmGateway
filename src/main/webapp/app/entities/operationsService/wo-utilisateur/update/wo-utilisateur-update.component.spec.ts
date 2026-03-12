import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { WoUtilisateurFormService } from './wo-utilisateur-form.service';
import { WoUtilisateurService } from '../service/wo-utilisateur.service';
import { IWoUtilisateur } from '../wo-utilisateur.model';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

import { WoUtilisateurUpdateComponent } from './wo-utilisateur-update.component';

describe('WoUtilisateur Management Update Component', () => {
  let comp: WoUtilisateurUpdateComponent;
  let fixture: ComponentFixture<WoUtilisateurUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let woUtilisateurFormService: WoUtilisateurFormService;
  let woUtilisateurService: WoUtilisateurService;
  let workOrderService: WorkOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [WoUtilisateurUpdateComponent],
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
      .overrideTemplate(WoUtilisateurUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(WoUtilisateurUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    woUtilisateurFormService = TestBed.inject(WoUtilisateurFormService);
    woUtilisateurService = TestBed.inject(WoUtilisateurService);
    workOrderService = TestBed.inject(WorkOrderService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call WorkOrder query and add missing value', () => {
      const woUtilisateur: IWoUtilisateur = { id: 456 };
      const workOrder: IWorkOrder = { id: 96583 };
      woUtilisateur.workOrder = workOrder;

      const workOrderCollection: IWorkOrder[] = [{ id: 85005 }];
      jest.spyOn(workOrderService, 'query').mockReturnValue(of(new HttpResponse({ body: workOrderCollection })));
      const additionalWorkOrders = [workOrder];
      const expectedCollection: IWorkOrder[] = [...additionalWorkOrders, ...workOrderCollection];
      jest.spyOn(workOrderService, 'addWorkOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ woUtilisateur });
      comp.ngOnInit();

      expect(workOrderService.query).toHaveBeenCalled();
      expect(workOrderService.addWorkOrderToCollectionIfMissing).toHaveBeenCalledWith(
        workOrderCollection,
        ...additionalWorkOrders.map(expect.objectContaining)
      );
      expect(comp.workOrdersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const woUtilisateur: IWoUtilisateur = { id: 456 };
      const workOrder: IWorkOrder = { id: 61940 };
      woUtilisateur.workOrder = workOrder;

      activatedRoute.data = of({ woUtilisateur });
      comp.ngOnInit();

      expect(comp.workOrdersSharedCollection).toContain(workOrder);
      expect(comp.woUtilisateur).toEqual(woUtilisateur);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoUtilisateur>>();
      const woUtilisateur = { id: 123 };
      jest.spyOn(woUtilisateurFormService, 'getWoUtilisateur').mockReturnValue(woUtilisateur);
      jest.spyOn(woUtilisateurService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woUtilisateur });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: woUtilisateur }));
      saveSubject.complete();

      // THEN
      expect(woUtilisateurFormService.getWoUtilisateur).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(woUtilisateurService.update).toHaveBeenCalledWith(expect.objectContaining(woUtilisateur));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoUtilisateur>>();
      const woUtilisateur = { id: 123 };
      jest.spyOn(woUtilisateurFormService, 'getWoUtilisateur').mockReturnValue({ id: null });
      jest.spyOn(woUtilisateurService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woUtilisateur: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: woUtilisateur }));
      saveSubject.complete();

      // THEN
      expect(woUtilisateurFormService.getWoUtilisateur).toHaveBeenCalled();
      expect(woUtilisateurService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWoUtilisateur>>();
      const woUtilisateur = { id: 123 };
      jest.spyOn(woUtilisateurService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ woUtilisateur });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(woUtilisateurService.update).toHaveBeenCalled();
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
