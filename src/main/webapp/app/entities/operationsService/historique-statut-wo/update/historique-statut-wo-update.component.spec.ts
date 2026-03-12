import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { HistoriqueStatutWOFormService } from './historique-statut-wo-form.service';
import { HistoriqueStatutWOService } from '../service/historique-statut-wo.service';
import { IHistoriqueStatutWO } from '../historique-statut-wo.model';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

import { HistoriqueStatutWOUpdateComponent } from './historique-statut-wo-update.component';

describe('HistoriqueStatutWO Management Update Component', () => {
  let comp: HistoriqueStatutWOUpdateComponent;
  let fixture: ComponentFixture<HistoriqueStatutWOUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let historiqueStatutWOFormService: HistoriqueStatutWOFormService;
  let historiqueStatutWOService: HistoriqueStatutWOService;
  let workOrderService: WorkOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [HistoriqueStatutWOUpdateComponent],
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
      .overrideTemplate(HistoriqueStatutWOUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(HistoriqueStatutWOUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    historiqueStatutWOFormService = TestBed.inject(HistoriqueStatutWOFormService);
    historiqueStatutWOService = TestBed.inject(HistoriqueStatutWOService);
    workOrderService = TestBed.inject(WorkOrderService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call WorkOrder query and add missing value', () => {
      const historiqueStatutWO: IHistoriqueStatutWO = { id: 456 };
      const workOrder: IWorkOrder = { id: 53159 };
      historiqueStatutWO.workOrder = workOrder;

      const workOrderCollection: IWorkOrder[] = [{ id: 64917 }];
      jest.spyOn(workOrderService, 'query').mockReturnValue(of(new HttpResponse({ body: workOrderCollection })));
      const additionalWorkOrders = [workOrder];
      const expectedCollection: IWorkOrder[] = [...additionalWorkOrders, ...workOrderCollection];
      jest.spyOn(workOrderService, 'addWorkOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ historiqueStatutWO });
      comp.ngOnInit();

      expect(workOrderService.query).toHaveBeenCalled();
      expect(workOrderService.addWorkOrderToCollectionIfMissing).toHaveBeenCalledWith(
        workOrderCollection,
        ...additionalWorkOrders.map(expect.objectContaining)
      );
      expect(comp.workOrdersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const historiqueStatutWO: IHistoriqueStatutWO = { id: 456 };
      const workOrder: IWorkOrder = { id: 83415 };
      historiqueStatutWO.workOrder = workOrder;

      activatedRoute.data = of({ historiqueStatutWO });
      comp.ngOnInit();

      expect(comp.workOrdersSharedCollection).toContain(workOrder);
      expect(comp.historiqueStatutWO).toEqual(historiqueStatutWO);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHistoriqueStatutWO>>();
      const historiqueStatutWO = { id: 123 };
      jest.spyOn(historiqueStatutWOFormService, 'getHistoriqueStatutWO').mockReturnValue(historiqueStatutWO);
      jest.spyOn(historiqueStatutWOService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ historiqueStatutWO });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: historiqueStatutWO }));
      saveSubject.complete();

      // THEN
      expect(historiqueStatutWOFormService.getHistoriqueStatutWO).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(historiqueStatutWOService.update).toHaveBeenCalledWith(expect.objectContaining(historiqueStatutWO));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHistoriqueStatutWO>>();
      const historiqueStatutWO = { id: 123 };
      jest.spyOn(historiqueStatutWOFormService, 'getHistoriqueStatutWO').mockReturnValue({ id: null });
      jest.spyOn(historiqueStatutWOService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ historiqueStatutWO: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: historiqueStatutWO }));
      saveSubject.complete();

      // THEN
      expect(historiqueStatutWOFormService.getHistoriqueStatutWO).toHaveBeenCalled();
      expect(historiqueStatutWOService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHistoriqueStatutWO>>();
      const historiqueStatutWO = { id: 123 };
      jest.spyOn(historiqueStatutWOService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ historiqueStatutWO });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(historiqueStatutWOService.update).toHaveBeenCalled();
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
