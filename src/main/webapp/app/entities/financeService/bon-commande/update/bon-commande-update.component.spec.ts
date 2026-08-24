import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { BonCommandeFormService } from './bon-commande-form.service';
import { BonCommandeService } from '../service/bon-commande.service';
import { IBonCommande } from '../bon-commande.model';

import { BonCommandeUpdateComponent } from './bon-commande-update.component';

describe('BonCommande Management Update Component', () => {
  let comp: BonCommandeUpdateComponent;
  let fixture: ComponentFixture<BonCommandeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let bonCommandeFormService: BonCommandeFormService;
  let bonCommandeService: BonCommandeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [BonCommandeUpdateComponent],
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
      .overrideTemplate(BonCommandeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(BonCommandeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    bonCommandeFormService = TestBed.inject(BonCommandeFormService);
    bonCommandeService = TestBed.inject(BonCommandeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const bonCommande: IBonCommande = { id: 456 };

      activatedRoute.data = of({ bonCommande });
      comp.ngOnInit();

      expect(comp.bonCommande).toEqual(bonCommande);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBonCommande>>();
      const bonCommande = { id: 123 };
      jest.spyOn(bonCommandeFormService, 'getBonCommande').mockReturnValue(bonCommande);
      jest.spyOn(bonCommandeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bonCommande });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: bonCommande }));
      saveSubject.complete();

      // THEN
      expect(bonCommandeFormService.getBonCommande).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(bonCommandeService.update).toHaveBeenCalledWith(expect.objectContaining(bonCommande));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBonCommande>>();
      const bonCommande = { id: 123 };
      jest.spyOn(bonCommandeFormService, 'getBonCommande').mockReturnValue({ id: null });
      jest.spyOn(bonCommandeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bonCommande: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: bonCommande }));
      saveSubject.complete();

      // THEN
      expect(bonCommandeFormService.getBonCommande).toHaveBeenCalled();
      expect(bonCommandeService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBonCommande>>();
      const bonCommande = { id: 123 };
      jest.spyOn(bonCommandeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ bonCommande });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(bonCommandeService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
