import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ModelPhaseOTFormService } from './model-phase-ot-form.service';
import { ModelPhaseOTService } from '../service/model-phase-ot.service';
import { IModelPhaseOT } from '../model-phase-ot.model';

import { ModelPhaseOTUpdateComponent } from './model-phase-ot-update.component';

describe('ModelPhaseOT Management Update Component', () => {
  let comp: ModelPhaseOTUpdateComponent;
  let fixture: ComponentFixture<ModelPhaseOTUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let modelPhaseOTFormService: ModelPhaseOTFormService;
  let modelPhaseOTService: ModelPhaseOTService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ModelPhaseOTUpdateComponent],
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
      .overrideTemplate(ModelPhaseOTUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ModelPhaseOTUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    modelPhaseOTFormService = TestBed.inject(ModelPhaseOTFormService);
    modelPhaseOTService = TestBed.inject(ModelPhaseOTService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const modelPhaseOT: IModelPhaseOT = { id: 456 };

      activatedRoute.data = of({ modelPhaseOT });
      comp.ngOnInit();

      expect(comp.modelPhaseOT).toEqual(modelPhaseOT);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IModelPhaseOT>>();
      const modelPhaseOT = { id: 123 };
      jest.spyOn(modelPhaseOTFormService, 'getModelPhaseOT').mockReturnValue(modelPhaseOT);
      jest.spyOn(modelPhaseOTService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ modelPhaseOT });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: modelPhaseOT }));
      saveSubject.complete();

      // THEN
      expect(modelPhaseOTFormService.getModelPhaseOT).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(modelPhaseOTService.update).toHaveBeenCalledWith(expect.objectContaining(modelPhaseOT));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IModelPhaseOT>>();
      const modelPhaseOT = { id: 123 };
      jest.spyOn(modelPhaseOTFormService, 'getModelPhaseOT').mockReturnValue({ id: null });
      jest.spyOn(modelPhaseOTService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ modelPhaseOT: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: modelPhaseOT }));
      saveSubject.complete();

      // THEN
      expect(modelPhaseOTFormService.getModelPhaseOT).toHaveBeenCalled();
      expect(modelPhaseOTService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IModelPhaseOT>>();
      const modelPhaseOT = { id: 123 };
      jest.spyOn(modelPhaseOTService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ modelPhaseOT });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(modelPhaseOTService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
