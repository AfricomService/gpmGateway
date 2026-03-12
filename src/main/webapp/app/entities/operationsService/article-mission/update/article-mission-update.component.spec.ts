import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ArticleMissionFormService } from './article-mission-form.service';
import { ArticleMissionService } from '../service/article-mission.service';
import { IArticleMission } from '../article-mission.model';
import { IWorkOrder } from 'app/entities/operationsService/work-order/work-order.model';
import { WorkOrderService } from 'app/entities/operationsService/work-order/service/work-order.service';

import { ArticleMissionUpdateComponent } from './article-mission-update.component';

describe('ArticleMission Management Update Component', () => {
  let comp: ArticleMissionUpdateComponent;
  let fixture: ComponentFixture<ArticleMissionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let articleMissionFormService: ArticleMissionFormService;
  let articleMissionService: ArticleMissionService;
  let workOrderService: WorkOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ArticleMissionUpdateComponent],
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
      .overrideTemplate(ArticleMissionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ArticleMissionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    articleMissionFormService = TestBed.inject(ArticleMissionFormService);
    articleMissionService = TestBed.inject(ArticleMissionService);
    workOrderService = TestBed.inject(WorkOrderService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call WorkOrder query and add missing value', () => {
      const articleMission: IArticleMission = { id: 456 };
      const workOrder: IWorkOrder = { id: 89018 };
      articleMission.workOrder = workOrder;

      const workOrderCollection: IWorkOrder[] = [{ id: 87004 }];
      jest.spyOn(workOrderService, 'query').mockReturnValue(of(new HttpResponse({ body: workOrderCollection })));
      const additionalWorkOrders = [workOrder];
      const expectedCollection: IWorkOrder[] = [...additionalWorkOrders, ...workOrderCollection];
      jest.spyOn(workOrderService, 'addWorkOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ articleMission });
      comp.ngOnInit();

      expect(workOrderService.query).toHaveBeenCalled();
      expect(workOrderService.addWorkOrderToCollectionIfMissing).toHaveBeenCalledWith(
        workOrderCollection,
        ...additionalWorkOrders.map(expect.objectContaining)
      );
      expect(comp.workOrdersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const articleMission: IArticleMission = { id: 456 };
      const workOrder: IWorkOrder = { id: 32082 };
      articleMission.workOrder = workOrder;

      activatedRoute.data = of({ articleMission });
      comp.ngOnInit();

      expect(comp.workOrdersSharedCollection).toContain(workOrder);
      expect(comp.articleMission).toEqual(articleMission);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IArticleMission>>();
      const articleMission = { id: 123 };
      jest.spyOn(articleMissionFormService, 'getArticleMission').mockReturnValue(articleMission);
      jest.spyOn(articleMissionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ articleMission });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: articleMission }));
      saveSubject.complete();

      // THEN
      expect(articleMissionFormService.getArticleMission).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(articleMissionService.update).toHaveBeenCalledWith(expect.objectContaining(articleMission));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IArticleMission>>();
      const articleMission = { id: 123 };
      jest.spyOn(articleMissionFormService, 'getArticleMission').mockReturnValue({ id: null });
      jest.spyOn(articleMissionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ articleMission: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: articleMission }));
      saveSubject.complete();

      // THEN
      expect(articleMissionFormService.getArticleMission).toHaveBeenCalled();
      expect(articleMissionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IArticleMission>>();
      const articleMission = { id: 123 };
      jest.spyOn(articleMissionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ articleMission });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(articleMissionService.update).toHaveBeenCalled();
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
