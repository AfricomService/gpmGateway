import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { FactureWOFormService } from './facture-wo-form.service';
import { FactureWOService } from '../service/facture-wo.service';
import { IFactureWO } from '../facture-wo.model';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { FactureService } from 'app/entities/financeService/facture/service/facture.service';

import { FactureWOUpdateComponent } from './facture-wo-update.component';

describe('FactureWO Management Update Component', () => {
  let comp: FactureWOUpdateComponent;
  let fixture: ComponentFixture<FactureWOUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let factureWOFormService: FactureWOFormService;
  let factureWOService: FactureWOService;
  let factureService: FactureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [FactureWOUpdateComponent],
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
      .overrideTemplate(FactureWOUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FactureWOUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    factureWOFormService = TestBed.inject(FactureWOFormService);
    factureWOService = TestBed.inject(FactureWOService);
    factureService = TestBed.inject(FactureService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Facture query and add missing value', () => {
      const factureWO: IFactureWO = { id: 456 };
      const facture: IFacture = { id: 80656 };
      factureWO.facture = facture;

      const factureCollection: IFacture[] = [{ id: 77847 }];
      jest.spyOn(factureService, 'query').mockReturnValue(of(new HttpResponse({ body: factureCollection })));
      const additionalFactures = [facture];
      const expectedCollection: IFacture[] = [...additionalFactures, ...factureCollection];
      jest.spyOn(factureService, 'addFactureToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ factureWO });
      comp.ngOnInit();

      expect(factureService.query).toHaveBeenCalled();
      expect(factureService.addFactureToCollectionIfMissing).toHaveBeenCalledWith(
        factureCollection,
        ...additionalFactures.map(expect.objectContaining)
      );
      expect(comp.facturesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const factureWO: IFactureWO = { id: 456 };
      const facture: IFacture = { id: 63723 };
      factureWO.facture = facture;

      activatedRoute.data = of({ factureWO });
      comp.ngOnInit();

      expect(comp.facturesSharedCollection).toContain(facture);
      expect(comp.factureWO).toEqual(factureWO);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFactureWO>>();
      const factureWO = { id: 123 };
      jest.spyOn(factureWOFormService, 'getFactureWO').mockReturnValue(factureWO);
      jest.spyOn(factureWOService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ factureWO });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: factureWO }));
      saveSubject.complete();

      // THEN
      expect(factureWOFormService.getFactureWO).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(factureWOService.update).toHaveBeenCalledWith(expect.objectContaining(factureWO));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFactureWO>>();
      const factureWO = { id: 123 };
      jest.spyOn(factureWOFormService, 'getFactureWO').mockReturnValue({ id: null });
      jest.spyOn(factureWOService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ factureWO: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: factureWO }));
      saveSubject.complete();

      // THEN
      expect(factureWOFormService.getFactureWO).toHaveBeenCalled();
      expect(factureWOService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFactureWO>>();
      const factureWO = { id: 123 };
      jest.spyOn(factureWOService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ factureWO });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(factureWOService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareFacture', () => {
      it('Should forward to factureService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(factureService, 'compareFacture');
        comp.compareFacture(entity, entity2);
        expect(factureService.compareFacture).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
