import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { MatriceJourFerieFormService } from './matrice-jour-ferie-form.service';
import { MatriceJourFerieService } from '../service/matrice-jour-ferie.service';
import { IMatriceJourFerie } from '../matrice-jour-ferie.model';
import { IMatriceFacturation } from 'app/entities/projectService/matrice-facturation/matrice-facturation.model';
import { MatriceFacturationService } from 'app/entities/projectService/matrice-facturation/service/matrice-facturation.service';
import { IJourFerie } from 'app/entities/projectService/jour-ferie/jour-ferie.model';
import { JourFerieService } from 'app/entities/projectService/jour-ferie/service/jour-ferie.service';

import { MatriceJourFerieUpdateComponent } from './matrice-jour-ferie-update.component';

describe('MatriceJourFerie Management Update Component', () => {
  let comp: MatriceJourFerieUpdateComponent;
  let fixture: ComponentFixture<MatriceJourFerieUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let matriceJourFerieFormService: MatriceJourFerieFormService;
  let matriceJourFerieService: MatriceJourFerieService;
  let matriceFacturationService: MatriceFacturationService;
  let jourFerieService: JourFerieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [MatriceJourFerieUpdateComponent],
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
      .overrideTemplate(MatriceJourFerieUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(MatriceJourFerieUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    matriceJourFerieFormService = TestBed.inject(MatriceJourFerieFormService);
    matriceJourFerieService = TestBed.inject(MatriceJourFerieService);
    matriceFacturationService = TestBed.inject(MatriceFacturationService);
    jourFerieService = TestBed.inject(JourFerieService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call MatriceFacturation query and add missing value', () => {
      const matriceJourFerie: IMatriceJourFerie = { id: 456 };
      const matrice: IMatriceFacturation = { id: 54833 };
      matriceJourFerie.matrice = matrice;

      const matriceFacturationCollection: IMatriceFacturation[] = [{ id: 8398 }];
      jest.spyOn(matriceFacturationService, 'query').mockReturnValue(of(new HttpResponse({ body: matriceFacturationCollection })));
      const additionalMatriceFacturations = [matrice];
      const expectedCollection: IMatriceFacturation[] = [...additionalMatriceFacturations, ...matriceFacturationCollection];
      jest.spyOn(matriceFacturationService, 'addMatriceFacturationToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ matriceJourFerie });
      comp.ngOnInit();

      expect(matriceFacturationService.query).toHaveBeenCalled();
      expect(matriceFacturationService.addMatriceFacturationToCollectionIfMissing).toHaveBeenCalledWith(
        matriceFacturationCollection,
        ...additionalMatriceFacturations.map(expect.objectContaining)
      );
      expect(comp.matriceFacturationsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call JourFerie query and add missing value', () => {
      const matriceJourFerie: IMatriceJourFerie = { id: 456 };
      const jourFerie: IJourFerie = { id: 72974 };
      matriceJourFerie.jourFerie = jourFerie;

      const jourFerieCollection: IJourFerie[] = [{ id: 52359 }];
      jest.spyOn(jourFerieService, 'query').mockReturnValue(of(new HttpResponse({ body: jourFerieCollection })));
      const additionalJourFeries = [jourFerie];
      const expectedCollection: IJourFerie[] = [...additionalJourFeries, ...jourFerieCollection];
      jest.spyOn(jourFerieService, 'addJourFerieToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ matriceJourFerie });
      comp.ngOnInit();

      expect(jourFerieService.query).toHaveBeenCalled();
      expect(jourFerieService.addJourFerieToCollectionIfMissing).toHaveBeenCalledWith(
        jourFerieCollection,
        ...additionalJourFeries.map(expect.objectContaining)
      );
      expect(comp.jourFeriesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const matriceJourFerie: IMatriceJourFerie = { id: 456 };
      const matrice: IMatriceFacturation = { id: 19420 };
      matriceJourFerie.matrice = matrice;
      const jourFerie: IJourFerie = { id: 17778 };
      matriceJourFerie.jourFerie = jourFerie;

      activatedRoute.data = of({ matriceJourFerie });
      comp.ngOnInit();

      expect(comp.matriceFacturationsSharedCollection).toContain(matrice);
      expect(comp.jourFeriesSharedCollection).toContain(jourFerie);
      expect(comp.matriceJourFerie).toEqual(matriceJourFerie);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMatriceJourFerie>>();
      const matriceJourFerie = { id: 123 };
      jest.spyOn(matriceJourFerieFormService, 'getMatriceJourFerie').mockReturnValue(matriceJourFerie);
      jest.spyOn(matriceJourFerieService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ matriceJourFerie });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: matriceJourFerie }));
      saveSubject.complete();

      // THEN
      expect(matriceJourFerieFormService.getMatriceJourFerie).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(matriceJourFerieService.update).toHaveBeenCalledWith(expect.objectContaining(matriceJourFerie));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMatriceJourFerie>>();
      const matriceJourFerie = { id: 123 };
      jest.spyOn(matriceJourFerieFormService, 'getMatriceJourFerie').mockReturnValue({ id: null });
      jest.spyOn(matriceJourFerieService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ matriceJourFerie: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: matriceJourFerie }));
      saveSubject.complete();

      // THEN
      expect(matriceJourFerieFormService.getMatriceJourFerie).toHaveBeenCalled();
      expect(matriceJourFerieService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMatriceJourFerie>>();
      const matriceJourFerie = { id: 123 };
      jest.spyOn(matriceJourFerieService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ matriceJourFerie });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(matriceJourFerieService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareMatriceFacturation', () => {
      it('Should forward to matriceFacturationService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(matriceFacturationService, 'compareMatriceFacturation');
        comp.compareMatriceFacturation(entity, entity2);
        expect(matriceFacturationService.compareMatriceFacturation).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareJourFerie', () => {
      it('Should forward to jourFerieService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(jourFerieService, 'compareJourFerie');
        comp.compareJourFerie(entity, entity2);
        expect(jourFerieService.compareJourFerie).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
