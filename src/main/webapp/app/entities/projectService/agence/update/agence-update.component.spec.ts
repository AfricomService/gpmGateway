import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { AgenceFormService } from './agence-form.service';
import { AgenceService } from '../service/agence.service';
import { IAgence } from '../agence.model';
import { ISociete } from 'app/entities/projectService/societe/societe.model';
import { SocieteService } from 'app/entities/projectService/societe/service/societe.service';

import { AgenceUpdateComponent } from './agence-update.component';

describe('Agence Management Update Component', () => {
  let comp: AgenceUpdateComponent;
  let fixture: ComponentFixture<AgenceUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let agenceFormService: AgenceFormService;
  let agenceService: AgenceService;
  let societeService: SocieteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [AgenceUpdateComponent],
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
      .overrideTemplate(AgenceUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AgenceUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    agenceFormService = TestBed.inject(AgenceFormService);
    agenceService = TestBed.inject(AgenceService);
    societeService = TestBed.inject(SocieteService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Societe query and add missing value', () => {
      const agence: IAgence = { id: 456 };
      const societe: ISociete = { id: 17532 };
      agence.societe = societe;

      const societeCollection: ISociete[] = [{ id: 11829 }];
      jest.spyOn(societeService, 'query').mockReturnValue(of(new HttpResponse({ body: societeCollection })));
      const additionalSocietes = [societe];
      const expectedCollection: ISociete[] = [...additionalSocietes, ...societeCollection];
      jest.spyOn(societeService, 'addSocieteToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ agence });
      comp.ngOnInit();

      expect(societeService.query).toHaveBeenCalled();
      expect(societeService.addSocieteToCollectionIfMissing).toHaveBeenCalledWith(
        societeCollection,
        ...additionalSocietes.map(expect.objectContaining)
      );
      expect(comp.societesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const agence: IAgence = { id: 456 };
      const societe: ISociete = { id: 11121 };
      agence.societe = societe;

      activatedRoute.data = of({ agence });
      comp.ngOnInit();

      expect(comp.societesSharedCollection).toContain(societe);
      expect(comp.agence).toEqual(agence);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAgence>>();
      const agence = { id: 123 };
      jest.spyOn(agenceFormService, 'getAgence').mockReturnValue(agence);
      jest.spyOn(agenceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ agence });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: agence }));
      saveSubject.complete();

      // THEN
      expect(agenceFormService.getAgence).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(agenceService.update).toHaveBeenCalledWith(expect.objectContaining(agence));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAgence>>();
      const agence = { id: 123 };
      jest.spyOn(agenceFormService, 'getAgence').mockReturnValue({ id: null });
      jest.spyOn(agenceService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ agence: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: agence }));
      saveSubject.complete();

      // THEN
      expect(agenceFormService.getAgence).toHaveBeenCalled();
      expect(agenceService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAgence>>();
      const agence = { id: 123 };
      jest.spyOn(agenceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ agence });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(agenceService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareSociete', () => {
      it('Should forward to societeService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(societeService, 'compareSociete');
        comp.compareSociete(entity, entity2);
        expect(societeService.compareSociete).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
