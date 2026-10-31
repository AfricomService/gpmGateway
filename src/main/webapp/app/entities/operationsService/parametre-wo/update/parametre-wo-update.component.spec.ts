import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { ParametreWOFormService } from './parametre-wo-form.service';
import { ParametreWOService } from '../service/parametre-wo.service';
import { IParametreWO } from '../parametre-wo.model';

import { ParametreWOUpdateComponent } from './parametre-wo-update.component';

describe('ParametreWO Management Update Component', () => {
  let comp: ParametreWOUpdateComponent;
  let fixture: ComponentFixture<ParametreWOUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let parametreWOFormService: ParametreWOFormService;
  let parametreWOService: ParametreWOService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ParametreWOUpdateComponent],
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
      .overrideTemplate(ParametreWOUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ParametreWOUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    parametreWOFormService = TestBed.inject(ParametreWOFormService);
    parametreWOService = TestBed.inject(ParametreWOService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const parametreWO: IParametreWO = { id: 456 };

      activatedRoute.data = of({ parametreWO });
      comp.ngOnInit();

      expect(comp.parametreWO).toEqual(parametreWO);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IParametreWO>>();
      const parametreWO = { id: 123 };
      jest.spyOn(parametreWOFormService, 'getParametreWO').mockReturnValue(parametreWO);
      jest.spyOn(parametreWOService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ parametreWO });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: parametreWO }));
      saveSubject.complete();

      // THEN
      expect(parametreWOFormService.getParametreWO).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(parametreWOService.update).toHaveBeenCalledWith(expect.objectContaining(parametreWO));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IParametreWO>>();
      const parametreWO = { id: 123 };
      jest.spyOn(parametreWOFormService, 'getParametreWO').mockReturnValue({ id: null });
      jest.spyOn(parametreWOService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ parametreWO: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: parametreWO }));
      saveSubject.complete();

      // THEN
      expect(parametreWOFormService.getParametreWO).toHaveBeenCalled();
      expect(parametreWOService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IParametreWO>>();
      const parametreWO = { id: 123 };
      jest.spyOn(parametreWOService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ parametreWO });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(parametreWOService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
