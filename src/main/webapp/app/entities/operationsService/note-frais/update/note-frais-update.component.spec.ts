import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { NoteFraisFormService } from './note-frais-form.service';
import { NoteFraisService } from '../service/note-frais.service';
import { INoteFrais } from '../note-frais.model';

import { NoteFraisUpdateComponent } from './note-frais-update.component';

describe('NoteFrais Management Update Component', () => {
  let comp: NoteFraisUpdateComponent;
  let fixture: ComponentFixture<NoteFraisUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let noteFraisFormService: NoteFraisFormService;
  let noteFraisService: NoteFraisService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [NoteFraisUpdateComponent],
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
      .overrideTemplate(NoteFraisUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(NoteFraisUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    noteFraisFormService = TestBed.inject(NoteFraisFormService);
    noteFraisService = TestBed.inject(NoteFraisService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const noteFrais: INoteFrais = { id: 456 };

      activatedRoute.data = of({ noteFrais });
      comp.ngOnInit();

      expect(comp.noteFrais).toEqual(noteFrais);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<INoteFrais>>();
      const noteFrais = { id: 123 };
      jest.spyOn(noteFraisFormService, 'getNoteFrais').mockReturnValue(noteFrais);
      jest.spyOn(noteFraisService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ noteFrais });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: noteFrais }));
      saveSubject.complete();

      // THEN
      expect(noteFraisFormService.getNoteFrais).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(noteFraisService.update).toHaveBeenCalledWith(expect.objectContaining(noteFrais));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<INoteFrais>>();
      const noteFrais = { id: 123 };
      jest.spyOn(noteFraisFormService, 'getNoteFrais').mockReturnValue({ id: null });
      jest.spyOn(noteFraisService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ noteFrais: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: noteFrais }));
      saveSubject.complete();

      // THEN
      expect(noteFraisFormService.getNoteFrais).toHaveBeenCalled();
      expect(noteFraisService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<INoteFrais>>();
      const noteFrais = { id: 123 };
      jest.spyOn(noteFraisService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ noteFrais });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(noteFraisService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
