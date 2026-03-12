import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { DemandeEspeceFormService } from './demande-espece-form.service';
import { DemandeEspeceService } from '../service/demande-espece.service';
import { IDemandeEspece } from '../demande-espece.model';

import { DemandeEspeceUpdateComponent } from './demande-espece-update.component';

describe('DemandeEspece Management Update Component', () => {
  let comp: DemandeEspeceUpdateComponent;
  let fixture: ComponentFixture<DemandeEspeceUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let demandeEspeceFormService: DemandeEspeceFormService;
  let demandeEspeceService: DemandeEspeceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [DemandeEspeceUpdateComponent],
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
      .overrideTemplate(DemandeEspeceUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DemandeEspeceUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    demandeEspeceFormService = TestBed.inject(DemandeEspeceFormService);
    demandeEspeceService = TestBed.inject(DemandeEspeceService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const demandeEspece: IDemandeEspece = { id: 456 };

      activatedRoute.data = of({ demandeEspece });
      comp.ngOnInit();

      expect(comp.demandeEspece).toEqual(demandeEspece);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDemandeEspece>>();
      const demandeEspece = { id: 123 };
      jest.spyOn(demandeEspeceFormService, 'getDemandeEspece').mockReturnValue(demandeEspece);
      jest.spyOn(demandeEspeceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ demandeEspece });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: demandeEspece }));
      saveSubject.complete();

      // THEN
      expect(demandeEspeceFormService.getDemandeEspece).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(demandeEspeceService.update).toHaveBeenCalledWith(expect.objectContaining(demandeEspece));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDemandeEspece>>();
      const demandeEspece = { id: 123 };
      jest.spyOn(demandeEspeceFormService, 'getDemandeEspece').mockReturnValue({ id: null });
      jest.spyOn(demandeEspeceService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ demandeEspece: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: demandeEspece }));
      saveSubject.complete();

      // THEN
      expect(demandeEspeceFormService.getDemandeEspece).toHaveBeenCalled();
      expect(demandeEspeceService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDemandeEspece>>();
      const demandeEspece = { id: 123 };
      jest.spyOn(demandeEspeceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ demandeEspece });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(demandeEspeceService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
