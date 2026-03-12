import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { AffaireFormService } from './affaire-form.service';
import { AffaireService } from '../service/affaire.service';
import { IAffaire } from '../affaire.model';
import { IClient } from 'app/entities/projectService/client/client.model';
import { ClientService } from 'app/entities/projectService/client/service/client.service';

import { AffaireUpdateComponent } from './affaire-update.component';

describe('Affaire Management Update Component', () => {
  let comp: AffaireUpdateComponent;
  let fixture: ComponentFixture<AffaireUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let affaireFormService: AffaireFormService;
  let affaireService: AffaireService;
  let clientService: ClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [AffaireUpdateComponent],
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
      .overrideTemplate(AffaireUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AffaireUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    affaireFormService = TestBed.inject(AffaireFormService);
    affaireService = TestBed.inject(AffaireService);
    clientService = TestBed.inject(ClientService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Client query and add missing value', () => {
      const affaire: IAffaire = { id: 456 };
      const client: IClient = { id: 33411 };
      affaire.client = client;

      const clientCollection: IClient[] = [{ id: 29613 }];
      jest.spyOn(clientService, 'query').mockReturnValue(of(new HttpResponse({ body: clientCollection })));
      const additionalClients = [client];
      const expectedCollection: IClient[] = [...additionalClients, ...clientCollection];
      jest.spyOn(clientService, 'addClientToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ affaire });
      comp.ngOnInit();

      expect(clientService.query).toHaveBeenCalled();
      expect(clientService.addClientToCollectionIfMissing).toHaveBeenCalledWith(
        clientCollection,
        ...additionalClients.map(expect.objectContaining)
      );
      expect(comp.clientsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const affaire: IAffaire = { id: 456 };
      const client: IClient = { id: 20972 };
      affaire.client = client;

      activatedRoute.data = of({ affaire });
      comp.ngOnInit();

      expect(comp.clientsSharedCollection).toContain(client);
      expect(comp.affaire).toEqual(affaire);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAffaire>>();
      const affaire = { id: 123 };
      jest.spyOn(affaireFormService, 'getAffaire').mockReturnValue(affaire);
      jest.spyOn(affaireService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affaire });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: affaire }));
      saveSubject.complete();

      // THEN
      expect(affaireFormService.getAffaire).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(affaireService.update).toHaveBeenCalledWith(expect.objectContaining(affaire));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAffaire>>();
      const affaire = { id: 123 };
      jest.spyOn(affaireFormService, 'getAffaire').mockReturnValue({ id: null });
      jest.spyOn(affaireService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affaire: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: affaire }));
      saveSubject.complete();

      // THEN
      expect(affaireFormService.getAffaire).toHaveBeenCalled();
      expect(affaireService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IAffaire>>();
      const affaire = { id: 123 };
      jest.spyOn(affaireService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affaire });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(affaireService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareClient', () => {
      it('Should forward to clientService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(clientService, 'compareClient');
        comp.compareClient(entity, entity2);
        expect(clientService.compareClient).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
