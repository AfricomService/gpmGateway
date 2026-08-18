import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { RessourceFormService } from './ressource-form.service';
import { RessourceService } from '../service/ressource.service';
import { IRessource } from '../ressource.model';

import { RessourceUpdateComponent } from './ressource-update.component';

describe('Ressource Management Update Component', () => {
  let comp: RessourceUpdateComponent;
  let fixture: ComponentFixture<RessourceUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let ressourceFormService: RessourceFormService;
  let ressourceService: RessourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [RessourceUpdateComponent],
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
      .overrideTemplate(RessourceUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(RessourceUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    ressourceFormService = TestBed.inject(RessourceFormService);
    ressourceService = TestBed.inject(RessourceService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const ressource: IRessource = { id: 456 };

      activatedRoute.data = of({ ressource });
      comp.ngOnInit();

      expect(comp.ressource).toEqual(ressource);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRessource>>();
      const ressource = { id: 123 };
      jest.spyOn(ressourceFormService, 'getRessource').mockReturnValue(ressource);
      jest.spyOn(ressourceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ressource });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: ressource }));
      saveSubject.complete();

      // THEN
      expect(ressourceFormService.getRessource).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(ressourceService.update).toHaveBeenCalledWith(expect.objectContaining(ressource));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRessource>>();
      const ressource = { id: 123 };
      jest.spyOn(ressourceFormService, 'getRessource').mockReturnValue({ id: null });
      jest.spyOn(ressourceService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ressource: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: ressource }));
      saveSubject.complete();

      // THEN
      expect(ressourceFormService.getRessource).toHaveBeenCalled();
      expect(ressourceService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRessource>>();
      const ressource = { id: 123 };
      jest.spyOn(ressourceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ ressource });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(ressourceService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
