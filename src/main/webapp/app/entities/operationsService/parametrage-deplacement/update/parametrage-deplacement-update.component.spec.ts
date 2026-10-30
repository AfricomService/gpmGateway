import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ParametrageDeplacementFormService } from './parametrage-deplacement-form.service';
import { ParametrageDeplacementService } from '../service/parametrage-deplacement.service';
import { IParametrageDeplacement } from '../parametrage-deplacement.model';

import { ParametrageDeplacementUpdateComponent } from './parametrage-deplacement-update.component';

describe('ParametrageDeplacement Management Update Component', () => {
  let comp: ParametrageDeplacementUpdateComponent;
  let fixture: ComponentFixture<ParametrageDeplacementUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let parametrageDeplacementFormService: ParametrageDeplacementFormService;
  let parametrageDeplacementService: ParametrageDeplacementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ParametrageDeplacementUpdateComponent],
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
      .overrideTemplate(ParametrageDeplacementUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ParametrageDeplacementUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    parametrageDeplacementFormService = TestBed.inject(ParametrageDeplacementFormService);
    parametrageDeplacementService = TestBed.inject(ParametrageDeplacementService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const parametrageDeplacement: IParametrageDeplacement = { id: 456 };

      activatedRoute.data = of({ parametrageDeplacement });
      comp.ngOnInit();

      expect(comp.parametrageDeplacement).toEqual(parametrageDeplacement);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IParametrageDeplacement>>();
      const parametrageDeplacement = { id: 123 };
      jest.spyOn(parametrageDeplacementFormService, 'getParametrageDeplacement').mockReturnValue(parametrageDeplacement);
      jest.spyOn(parametrageDeplacementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ parametrageDeplacement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: parametrageDeplacement }));
      saveSubject.complete();

      // THEN
      expect(parametrageDeplacementFormService.getParametrageDeplacement).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(parametrageDeplacementService.update).toHaveBeenCalledWith(expect.objectContaining(parametrageDeplacement));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IParametrageDeplacement>>();
      const parametrageDeplacement = { id: 123 };
      jest.spyOn(parametrageDeplacementFormService, 'getParametrageDeplacement').mockReturnValue({ id: null });
      jest.spyOn(parametrageDeplacementService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ parametrageDeplacement: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: parametrageDeplacement }));
      saveSubject.complete();

      // THEN
      expect(parametrageDeplacementFormService.getParametrageDeplacement).toHaveBeenCalled();
      expect(parametrageDeplacementService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IParametrageDeplacement>>();
      const parametrageDeplacement = { id: 123 };
      jest.spyOn(parametrageDeplacementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ parametrageDeplacement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(parametrageDeplacementService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
