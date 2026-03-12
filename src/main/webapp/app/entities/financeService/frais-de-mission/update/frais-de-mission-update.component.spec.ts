import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { FraisDeMissionFormService } from './frais-de-mission-form.service';
import { FraisDeMissionService } from '../service/frais-de-mission.service';
import { IFraisDeMission } from '../frais-de-mission.model';

import { FraisDeMissionUpdateComponent } from './frais-de-mission-update.component';

describe('FraisDeMission Management Update Component', () => {
  let comp: FraisDeMissionUpdateComponent;
  let fixture: ComponentFixture<FraisDeMissionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let fraisDeMissionFormService: FraisDeMissionFormService;
  let fraisDeMissionService: FraisDeMissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [FraisDeMissionUpdateComponent],
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
      .overrideTemplate(FraisDeMissionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FraisDeMissionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fraisDeMissionFormService = TestBed.inject(FraisDeMissionFormService);
    fraisDeMissionService = TestBed.inject(FraisDeMissionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const fraisDeMission: IFraisDeMission = { id: 456 };

      activatedRoute.data = of({ fraisDeMission });
      comp.ngOnInit();

      expect(comp.fraisDeMission).toEqual(fraisDeMission);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFraisDeMission>>();
      const fraisDeMission = { id: 123 };
      jest.spyOn(fraisDeMissionFormService, 'getFraisDeMission').mockReturnValue(fraisDeMission);
      jest.spyOn(fraisDeMissionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ fraisDeMission });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: fraisDeMission }));
      saveSubject.complete();

      // THEN
      expect(fraisDeMissionFormService.getFraisDeMission).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(fraisDeMissionService.update).toHaveBeenCalledWith(expect.objectContaining(fraisDeMission));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFraisDeMission>>();
      const fraisDeMission = { id: 123 };
      jest.spyOn(fraisDeMissionFormService, 'getFraisDeMission').mockReturnValue({ id: null });
      jest.spyOn(fraisDeMissionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ fraisDeMission: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: fraisDeMission }));
      saveSubject.complete();

      // THEN
      expect(fraisDeMissionFormService.getFraisDeMission).toHaveBeenCalled();
      expect(fraisDeMissionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFraisDeMission>>();
      const fraisDeMission = { id: 123 };
      jest.spyOn(fraisDeMissionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ fraisDeMission });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(fraisDeMissionService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
