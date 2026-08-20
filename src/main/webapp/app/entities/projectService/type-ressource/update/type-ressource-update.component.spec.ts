import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { TypeRessourceFormService } from './type-ressource-form.service';
import { TypeRessourceService } from '../service/type-ressource.service';
import { ITypeRessource } from '../type-ressource.model';

import { TypeRessourceUpdateComponent } from './type-ressource-update.component';

describe('TypeRessource Management Update Component', () => {
  let comp: TypeRessourceUpdateComponent;
  let fixture: ComponentFixture<TypeRessourceUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let typeRessourceFormService: TypeRessourceFormService;
  let typeRessourceService: TypeRessourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [TypeRessourceUpdateComponent],
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
      .overrideTemplate(TypeRessourceUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TypeRessourceUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    typeRessourceFormService = TestBed.inject(TypeRessourceFormService);
    typeRessourceService = TestBed.inject(TypeRessourceService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const typeRessource: ITypeRessource = { id: 456 };

      activatedRoute.data = of({ typeRessource });
      comp.ngOnInit();

      expect(comp.typeRessource).toEqual(typeRessource);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITypeRessource>>();
      const typeRessource = { id: 123 };
      jest.spyOn(typeRessourceFormService, 'getTypeRessource').mockReturnValue(typeRessource);
      jest.spyOn(typeRessourceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ typeRessource });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: typeRessource }));
      saveSubject.complete();

      // THEN
      expect(typeRessourceFormService.getTypeRessource).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(typeRessourceService.update).toHaveBeenCalledWith(expect.objectContaining(typeRessource));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITypeRessource>>();
      const typeRessource = { id: 123 };
      jest.spyOn(typeRessourceFormService, 'getTypeRessource').mockReturnValue({ id: null });
      jest.spyOn(typeRessourceService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ typeRessource: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: typeRessource }));
      saveSubject.complete();

      // THEN
      expect(typeRessourceFormService.getTypeRessource).toHaveBeenCalled();
      expect(typeRessourceService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITypeRessource>>();
      const typeRessource = { id: 123 };
      jest.spyOn(typeRessourceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ typeRessource });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(typeRessourceService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
