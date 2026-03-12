import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { OtExterneFormService } from './ot-externe-form.service';
import { OtExterneService } from '../service/ot-externe.service';
import { IOtExterne } from '../ot-externe.model';

import { OtExterneUpdateComponent } from './ot-externe-update.component';

describe('OtExterne Management Update Component', () => {
  let comp: OtExterneUpdateComponent;
  let fixture: ComponentFixture<OtExterneUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let otExterneFormService: OtExterneFormService;
  let otExterneService: OtExterneService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [OtExterneUpdateComponent],
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
      .overrideTemplate(OtExterneUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(OtExterneUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    otExterneFormService = TestBed.inject(OtExterneFormService);
    otExterneService = TestBed.inject(OtExterneService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const otExterne: IOtExterne = { id: 456 };

      activatedRoute.data = of({ otExterne });
      comp.ngOnInit();

      expect(comp.otExterne).toEqual(otExterne);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOtExterne>>();
      const otExterne = { id: 123 };
      jest.spyOn(otExterneFormService, 'getOtExterne').mockReturnValue(otExterne);
      jest.spyOn(otExterneService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ otExterne });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: otExterne }));
      saveSubject.complete();

      // THEN
      expect(otExterneFormService.getOtExterne).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(otExterneService.update).toHaveBeenCalledWith(expect.objectContaining(otExterne));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOtExterne>>();
      const otExterne = { id: 123 };
      jest.spyOn(otExterneFormService, 'getOtExterne').mockReturnValue({ id: null });
      jest.spyOn(otExterneService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ otExterne: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: otExterne }));
      saveSubject.complete();

      // THEN
      expect(otExterneFormService.getOtExterne).toHaveBeenCalled();
      expect(otExterneService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IOtExterne>>();
      const otExterne = { id: 123 };
      jest.spyOn(otExterneService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ otExterne });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(otExterneService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
