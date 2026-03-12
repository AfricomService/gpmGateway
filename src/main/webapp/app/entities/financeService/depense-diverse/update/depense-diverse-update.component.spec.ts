import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { DepenseDiverseFormService } from './depense-diverse-form.service';
import { DepenseDiverseService } from '../service/depense-diverse.service';
import { IDepenseDiverse } from '../depense-diverse.model';

import { DepenseDiverseUpdateComponent } from './depense-diverse-update.component';

describe('DepenseDiverse Management Update Component', () => {
  let comp: DepenseDiverseUpdateComponent;
  let fixture: ComponentFixture<DepenseDiverseUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let depenseDiverseFormService: DepenseDiverseFormService;
  let depenseDiverseService: DepenseDiverseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [DepenseDiverseUpdateComponent],
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
      .overrideTemplate(DepenseDiverseUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DepenseDiverseUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    depenseDiverseFormService = TestBed.inject(DepenseDiverseFormService);
    depenseDiverseService = TestBed.inject(DepenseDiverseService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const depenseDiverse: IDepenseDiverse = { id: 456 };

      activatedRoute.data = of({ depenseDiverse });
      comp.ngOnInit();

      expect(comp.depenseDiverse).toEqual(depenseDiverse);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDepenseDiverse>>();
      const depenseDiverse = { id: 123 };
      jest.spyOn(depenseDiverseFormService, 'getDepenseDiverse').mockReturnValue(depenseDiverse);
      jest.spyOn(depenseDiverseService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ depenseDiverse });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: depenseDiverse }));
      saveSubject.complete();

      // THEN
      expect(depenseDiverseFormService.getDepenseDiverse).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(depenseDiverseService.update).toHaveBeenCalledWith(expect.objectContaining(depenseDiverse));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDepenseDiverse>>();
      const depenseDiverse = { id: 123 };
      jest.spyOn(depenseDiverseFormService, 'getDepenseDiverse').mockReturnValue({ id: null });
      jest.spyOn(depenseDiverseService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ depenseDiverse: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: depenseDiverse }));
      saveSubject.complete();

      // THEN
      expect(depenseDiverseFormService.getDepenseDiverse).toHaveBeenCalled();
      expect(depenseDiverseService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDepenseDiverse>>();
      const depenseDiverse = { id: 123 };
      jest.spyOn(depenseDiverseService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ depenseDiverse });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(depenseDiverseService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
