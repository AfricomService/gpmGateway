import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { PhaseOtFormService } from './phase-ot-form.service';
import { PhaseOtService } from '../service/phase-ot.service';
import { IPhaseOt } from '../phase-ot.model';

import { PhaseOtUpdateComponent } from './phase-ot-update.component';

describe('PhaseOt Management Update Component', () => {
  let comp: PhaseOtUpdateComponent;
  let fixture: ComponentFixture<PhaseOtUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let phaseOtFormService: PhaseOtFormService;
  let phaseOtService: PhaseOtService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [PhaseOtUpdateComponent],
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
      .overrideTemplate(PhaseOtUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PhaseOtUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    phaseOtFormService = TestBed.inject(PhaseOtFormService);
    phaseOtService = TestBed.inject(PhaseOtService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const phaseOt: IPhaseOt = { id: 456 };

      activatedRoute.data = of({ phaseOt });
      comp.ngOnInit();

      expect(comp.phaseOt).toEqual(phaseOt);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPhaseOt>>();
      const phaseOt = { id: 123 };
      jest.spyOn(phaseOtFormService, 'getPhaseOt').mockReturnValue(phaseOt);
      jest.spyOn(phaseOtService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ phaseOt });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: phaseOt }));
      saveSubject.complete();

      // THEN
      expect(phaseOtFormService.getPhaseOt).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(phaseOtService.update).toHaveBeenCalledWith(expect.objectContaining(phaseOt));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPhaseOt>>();
      const phaseOt = { id: 123 };
      jest.spyOn(phaseOtFormService, 'getPhaseOt').mockReturnValue({ id: null });
      jest.spyOn(phaseOtService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ phaseOt: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: phaseOt }));
      saveSubject.complete();

      // THEN
      expect(phaseOtFormService.getPhaseOt).toHaveBeenCalled();
      expect(phaseOtService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPhaseOt>>();
      const phaseOt = { id: 123 };
      jest.spyOn(phaseOtService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ phaseOt });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(phaseOtService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
