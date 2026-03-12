import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { DemandeAchatFormService } from './demande-achat-form.service';
import { DemandeAchatService } from '../service/demande-achat.service';
import { IDemandeAchat } from '../demande-achat.model';

import { DemandeAchatUpdateComponent } from './demande-achat-update.component';

describe('DemandeAchat Management Update Component', () => {
  let comp: DemandeAchatUpdateComponent;
  let fixture: ComponentFixture<DemandeAchatUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let demandeAchatFormService: DemandeAchatFormService;
  let demandeAchatService: DemandeAchatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [DemandeAchatUpdateComponent],
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
      .overrideTemplate(DemandeAchatUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DemandeAchatUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    demandeAchatFormService = TestBed.inject(DemandeAchatFormService);
    demandeAchatService = TestBed.inject(DemandeAchatService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const demandeAchat: IDemandeAchat = { id: 456 };

      activatedRoute.data = of({ demandeAchat });
      comp.ngOnInit();

      expect(comp.demandeAchat).toEqual(demandeAchat);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDemandeAchat>>();
      const demandeAchat = { id: 123 };
      jest.spyOn(demandeAchatFormService, 'getDemandeAchat').mockReturnValue(demandeAchat);
      jest.spyOn(demandeAchatService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ demandeAchat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: demandeAchat }));
      saveSubject.complete();

      // THEN
      expect(demandeAchatFormService.getDemandeAchat).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(demandeAchatService.update).toHaveBeenCalledWith(expect.objectContaining(demandeAchat));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDemandeAchat>>();
      const demandeAchat = { id: 123 };
      jest.spyOn(demandeAchatFormService, 'getDemandeAchat').mockReturnValue({ id: null });
      jest.spyOn(demandeAchatService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ demandeAchat: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: demandeAchat }));
      saveSubject.complete();

      // THEN
      expect(demandeAchatFormService.getDemandeAchat).toHaveBeenCalled();
      expect(demandeAchatService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDemandeAchat>>();
      const demandeAchat = { id: 123 };
      jest.spyOn(demandeAchatService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ demandeAchat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(demandeAchatService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
