import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { DevisFormService } from './devis-form.service';
import { DevisService } from '../service/devis.service';
import { IDevis } from '../devis.model';
import { IFacture } from 'app/entities/financeService/facture/facture.model';
import { FactureService } from 'app/entities/financeService/facture/service/facture.service';

import { DevisUpdateComponent } from './devis-update.component';

describe('Devis Management Update Component', () => {
  let comp: DevisUpdateComponent;
  let fixture: ComponentFixture<DevisUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let devisFormService: DevisFormService;
  let devisService: DevisService;
  let factureService: FactureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [DevisUpdateComponent],
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
      .overrideTemplate(DevisUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DevisUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    devisFormService = TestBed.inject(DevisFormService);
    devisService = TestBed.inject(DevisService);
    factureService = TestBed.inject(FactureService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Facture query and add missing value', () => {
      const devis: IDevis = { id: 456 };
      const facture: IFacture = { id: 6110 };
      devis.facture = facture;

      const factureCollection: IFacture[] = [{ id: 6591 }];
      jest.spyOn(factureService, 'query').mockReturnValue(of(new HttpResponse({ body: factureCollection })));
      const additionalFactures = [facture];
      const expectedCollection: IFacture[] = [...additionalFactures, ...factureCollection];
      jest.spyOn(factureService, 'addFactureToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ devis });
      comp.ngOnInit();

      expect(factureService.query).toHaveBeenCalled();
      expect(factureService.addFactureToCollectionIfMissing).toHaveBeenCalledWith(
        factureCollection,
        ...additionalFactures.map(expect.objectContaining)
      );
      expect(comp.facturesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const devis: IDevis = { id: 456 };
      const facture: IFacture = { id: 64373 };
      devis.facture = facture;

      activatedRoute.data = of({ devis });
      comp.ngOnInit();

      expect(comp.facturesSharedCollection).toContain(facture);
      expect(comp.devis).toEqual(devis);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDevis>>();
      const devis = { id: 123 };
      jest.spyOn(devisFormService, 'getDevis').mockReturnValue(devis);
      jest.spyOn(devisService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ devis });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: devis }));
      saveSubject.complete();

      // THEN
      expect(devisFormService.getDevis).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(devisService.update).toHaveBeenCalledWith(expect.objectContaining(devis));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDevis>>();
      const devis = { id: 123 };
      jest.spyOn(devisFormService, 'getDevis').mockReturnValue({ id: null });
      jest.spyOn(devisService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ devis: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: devis }));
      saveSubject.complete();

      // THEN
      expect(devisFormService.getDevis).toHaveBeenCalled();
      expect(devisService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDevis>>();
      const devis = { id: 123 };
      jest.spyOn(devisService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ devis });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(devisService.update).toHaveBeenCalled();
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
