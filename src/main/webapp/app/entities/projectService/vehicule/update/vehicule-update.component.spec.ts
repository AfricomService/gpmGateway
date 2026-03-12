import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { VehiculeFormService } from './vehicule-form.service';
import { VehiculeService } from '../service/vehicule.service';
import { IVehicule } from '../vehicule.model';
import { IAgence } from 'app/entities/projectService/agence/agence.model';
import { AgenceService } from 'app/entities/projectService/agence/service/agence.service';

import { VehiculeUpdateComponent } from './vehicule-update.component';

describe('Vehicule Management Update Component', () => {
  let comp: VehiculeUpdateComponent;
  let fixture: ComponentFixture<VehiculeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let vehiculeFormService: VehiculeFormService;
  let vehiculeService: VehiculeService;
  let agenceService: AgenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [VehiculeUpdateComponent],
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
      .overrideTemplate(VehiculeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(VehiculeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    vehiculeFormService = TestBed.inject(VehiculeFormService);
    vehiculeService = TestBed.inject(VehiculeService);
    agenceService = TestBed.inject(AgenceService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Agence query and add missing value', () => {
      const vehicule: IVehicule = { id: 456 };
      const agence: IAgence = { id: 54267 };
      vehicule.agence = agence;

      const agenceCollection: IAgence[] = [{ id: 86937 }];
      jest.spyOn(agenceService, 'query').mockReturnValue(of(new HttpResponse({ body: agenceCollection })));
      const additionalAgences = [agence];
      const expectedCollection: IAgence[] = [...additionalAgences, ...agenceCollection];
      jest.spyOn(agenceService, 'addAgenceToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ vehicule });
      comp.ngOnInit();

      expect(agenceService.query).toHaveBeenCalled();
      expect(agenceService.addAgenceToCollectionIfMissing).toHaveBeenCalledWith(
        agenceCollection,
        ...additionalAgences.map(expect.objectContaining)
      );
      expect(comp.agencesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const vehicule: IVehicule = { id: 456 };
      const agence: IAgence = { id: 56047 };
      vehicule.agence = agence;

      activatedRoute.data = of({ vehicule });
      comp.ngOnInit();

      expect(comp.agencesSharedCollection).toContain(agence);
      expect(comp.vehicule).toEqual(vehicule);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVehicule>>();
      const vehicule = { id: 123 };
      jest.spyOn(vehiculeFormService, 'getVehicule').mockReturnValue(vehicule);
      jest.spyOn(vehiculeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ vehicule });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: vehicule }));
      saveSubject.complete();

      // THEN
      expect(vehiculeFormService.getVehicule).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(vehiculeService.update).toHaveBeenCalledWith(expect.objectContaining(vehicule));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVehicule>>();
      const vehicule = { id: 123 };
      jest.spyOn(vehiculeFormService, 'getVehicule').mockReturnValue({ id: null });
      jest.spyOn(vehiculeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ vehicule: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: vehicule }));
      saveSubject.complete();

      // THEN
      expect(vehiculeFormService.getVehicule).toHaveBeenCalled();
      expect(vehiculeService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IVehicule>>();
      const vehicule = { id: 123 };
      jest.spyOn(vehiculeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ vehicule });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(vehiculeService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareAgence', () => {
      it('Should forward to agenceService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(agenceService, 'compareAgence');
        comp.compareAgence(entity, entity2);
        expect(agenceService.compareAgence).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
