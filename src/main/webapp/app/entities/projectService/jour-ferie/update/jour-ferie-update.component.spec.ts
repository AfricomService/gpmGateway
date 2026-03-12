import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { JourFerieFormService } from './jour-ferie-form.service';
import { JourFerieService } from '../service/jour-ferie.service';
import { IJourFerie } from '../jour-ferie.model';

import { JourFerieUpdateComponent } from './jour-ferie-update.component';

describe('JourFerie Management Update Component', () => {
  let comp: JourFerieUpdateComponent;
  let fixture: ComponentFixture<JourFerieUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let jourFerieFormService: JourFerieFormService;
  let jourFerieService: JourFerieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [JourFerieUpdateComponent],
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
      .overrideTemplate(JourFerieUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(JourFerieUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    jourFerieFormService = TestBed.inject(JourFerieFormService);
    jourFerieService = TestBed.inject(JourFerieService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const jourFerie: IJourFerie = { id: 456 };

      activatedRoute.data = of({ jourFerie });
      comp.ngOnInit();

      expect(comp.jourFerie).toEqual(jourFerie);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJourFerie>>();
      const jourFerie = { id: 123 };
      jest.spyOn(jourFerieFormService, 'getJourFerie').mockReturnValue(jourFerie);
      jest.spyOn(jourFerieService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jourFerie });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: jourFerie }));
      saveSubject.complete();

      // THEN
      expect(jourFerieFormService.getJourFerie).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(jourFerieService.update).toHaveBeenCalledWith(expect.objectContaining(jourFerie));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJourFerie>>();
      const jourFerie = { id: 123 };
      jest.spyOn(jourFerieFormService, 'getJourFerie').mockReturnValue({ id: null });
      jest.spyOn(jourFerieService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jourFerie: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: jourFerie }));
      saveSubject.complete();

      // THEN
      expect(jourFerieFormService.getJourFerie).toHaveBeenCalled();
      expect(jourFerieService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJourFerie>>();
      const jourFerie = { id: 123 };
      jest.spyOn(jourFerieService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jourFerie });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(jourFerieService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
