import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { WorkOrderFormService } from './work-order-form.service';
import { WorkOrderService } from '../service/work-order.service';
import { IWorkOrder } from '../work-order.model';

import { WorkOrderUpdateComponent } from './work-order-update.component';

describe('WorkOrder Management Update Component', () => {
  let comp: WorkOrderUpdateComponent;
  let fixture: ComponentFixture<WorkOrderUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let workOrderFormService: WorkOrderFormService;
  let workOrderService: WorkOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [WorkOrderUpdateComponent],
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
      .overrideTemplate(WorkOrderUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(WorkOrderUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    workOrderFormService = TestBed.inject(WorkOrderFormService);
    workOrderService = TestBed.inject(WorkOrderService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const workOrder: IWorkOrder = { id: 456 };

      activatedRoute.data = of({ workOrder });
      comp.ngOnInit();

      expect(comp.workOrder).toEqual(workOrder);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWorkOrder>>();
      const workOrder = { id: 123 };
      jest.spyOn(workOrderFormService, 'getWorkOrder').mockReturnValue(workOrder);
      jest.spyOn(workOrderService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ workOrder });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: workOrder }));
      saveSubject.complete();

      // THEN
      expect(workOrderFormService.getWorkOrder).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(workOrderService.update).toHaveBeenCalledWith(expect.objectContaining(workOrder));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWorkOrder>>();
      const workOrder = { id: 123 };
      jest.spyOn(workOrderFormService, 'getWorkOrder').mockReturnValue({ id: null });
      jest.spyOn(workOrderService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ workOrder: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: workOrder }));
      saveSubject.complete();

      // THEN
      expect(workOrderFormService.getWorkOrder).toHaveBeenCalled();
      expect(workOrderService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IWorkOrder>>();
      const workOrder = { id: 123 };
      jest.spyOn(workOrderService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ workOrder });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(workOrderService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
