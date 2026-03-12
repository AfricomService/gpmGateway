import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { MatriceFacturationFormService } from './matrice-facturation-form.service';
import { MatriceFacturationService } from '../service/matrice-facturation.service';
import { IMatriceFacturation } from '../matrice-facturation.model';
import { IAffaire } from 'app/entities/projectService/affaire/affaire.model';
import { AffaireService } from 'app/entities/projectService/affaire/service/affaire.service';
import { IVille } from 'app/entities/projectService/ville/ville.model';
import { VilleService } from 'app/entities/projectService/ville/service/ville.service';
import { IZone } from 'app/entities/projectService/zone/zone.model';
import { ZoneService } from 'app/entities/projectService/zone/service/zone.service';

import { MatriceFacturationUpdateComponent } from './matrice-facturation-update.component';

describe('MatriceFacturation Management Update Component', () => {
  let comp: MatriceFacturationUpdateComponent;
  let fixture: ComponentFixture<MatriceFacturationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let matriceFacturationFormService: MatriceFacturationFormService;
  let matriceFacturationService: MatriceFacturationService;
  let affaireService: AffaireService;
  let villeService: VilleService;
  let zoneService: ZoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [MatriceFacturationUpdateComponent],
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
      .overrideTemplate(MatriceFacturationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(MatriceFacturationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    matriceFacturationFormService = TestBed.inject(MatriceFacturationFormService);
    matriceFacturationService = TestBed.inject(MatriceFacturationService);
    affaireService = TestBed.inject(AffaireService);
    villeService = TestBed.inject(VilleService);
    zoneService = TestBed.inject(ZoneService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Affaire query and add missing value', () => {
      const matriceFacturation: IMatriceFacturation = { id: 456 };
      const affaire: IAffaire = { id: 98143 };
      matriceFacturation.affaire = affaire;

      const affaireCollection: IAffaire[] = [{ id: 3345 }];
      jest.spyOn(affaireService, 'query').mockReturnValue(of(new HttpResponse({ body: affaireCollection })));
      const additionalAffaires = [affaire];
      const expectedCollection: IAffaire[] = [...additionalAffaires, ...affaireCollection];
      jest.spyOn(affaireService, 'addAffaireToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ matriceFacturation });
      comp.ngOnInit();

      expect(affaireService.query).toHaveBeenCalled();
      expect(affaireService.addAffaireToCollectionIfMissing).toHaveBeenCalledWith(
        affaireCollection,
        ...additionalAffaires.map(expect.objectContaining)
      );
      expect(comp.affairesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Ville query and add missing value', () => {
      const matriceFacturation: IMatriceFacturation = { id: 456 };
      const ville: IVille = { id: 50053 };
      matriceFacturation.ville = ville;

      const villeCollection: IVille[] = [{ id: 81966 }];
      jest.spyOn(villeService, 'query').mockReturnValue(of(new HttpResponse({ body: villeCollection })));
      const additionalVilles = [ville];
      const expectedCollection: IVille[] = [...additionalVilles, ...villeCollection];
      jest.spyOn(villeService, 'addVilleToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ matriceFacturation });
      comp.ngOnInit();

      expect(villeService.query).toHaveBeenCalled();
      expect(villeService.addVilleToCollectionIfMissing).toHaveBeenCalledWith(
        villeCollection,
        ...additionalVilles.map(expect.objectContaining)
      );
      expect(comp.villesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Zone query and add missing value', () => {
      const matriceFacturation: IMatriceFacturation = { id: 456 };
      const zone: IZone = { id: 15953 };
      matriceFacturation.zone = zone;

      const zoneCollection: IZone[] = [{ id: 30281 }];
      jest.spyOn(zoneService, 'query').mockReturnValue(of(new HttpResponse({ body: zoneCollection })));
      const additionalZones = [zone];
      const expectedCollection: IZone[] = [...additionalZones, ...zoneCollection];
      jest.spyOn(zoneService, 'addZoneToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ matriceFacturation });
      comp.ngOnInit();

      expect(zoneService.query).toHaveBeenCalled();
      expect(zoneService.addZoneToCollectionIfMissing).toHaveBeenCalledWith(
        zoneCollection,
        ...additionalZones.map(expect.objectContaining)
      );
      expect(comp.zonesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const matriceFacturation: IMatriceFacturation = { id: 456 };
      const affaire: IAffaire = { id: 8315 };
      matriceFacturation.affaire = affaire;
      const ville: IVille = { id: 60424 };
      matriceFacturation.ville = ville;
      const zone: IZone = { id: 28836 };
      matriceFacturation.zone = zone;

      activatedRoute.data = of({ matriceFacturation });
      comp.ngOnInit();

      expect(comp.affairesSharedCollection).toContain(affaire);
      expect(comp.villesSharedCollection).toContain(ville);
      expect(comp.zonesSharedCollection).toContain(zone);
      expect(comp.matriceFacturation).toEqual(matriceFacturation);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMatriceFacturation>>();
      const matriceFacturation = { id: 123 };
      jest.spyOn(matriceFacturationFormService, 'getMatriceFacturation').mockReturnValue(matriceFacturation);
      jest.spyOn(matriceFacturationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ matriceFacturation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: matriceFacturation }));
      saveSubject.complete();

      // THEN
      expect(matriceFacturationFormService.getMatriceFacturation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(matriceFacturationService.update).toHaveBeenCalledWith(expect.objectContaining(matriceFacturation));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMatriceFacturation>>();
      const matriceFacturation = { id: 123 };
      jest.spyOn(matriceFacturationFormService, 'getMatriceFacturation').mockReturnValue({ id: null });
      jest.spyOn(matriceFacturationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ matriceFacturation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: matriceFacturation }));
      saveSubject.complete();

      // THEN
      expect(matriceFacturationFormService.getMatriceFacturation).toHaveBeenCalled();
      expect(matriceFacturationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IMatriceFacturation>>();
      const matriceFacturation = { id: 123 };
      jest.spyOn(matriceFacturationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ matriceFacturation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(matriceFacturationService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareAffaire', () => {
      it('Should forward to affaireService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(affaireService, 'compareAffaire');
        comp.compareAffaire(entity, entity2);
        expect(affaireService.compareAffaire).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareVille', () => {
      it('Should forward to villeService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(villeService, 'compareVille');
        comp.compareVille(entity, entity2);
        expect(villeService.compareVille).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareZone', () => {
      it('Should forward to zoneService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(zoneService, 'compareZone');
        comp.compareZone(entity, entity2);
        expect(zoneService.compareZone).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
