import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { DetailRessourceFormService } from './detail-ressource-form.service';
import { DetailRessourceService } from '../service/detail-ressource.service';
import { IDetailRessource } from '../detail-ressource.model';

import { DetailRessourceUpdateComponent } from './detail-ressource-update.component';

describe('DetailRessource Management Update Component', () => {
  let comp: DetailRessourceUpdateComponent;
  let fixture: ComponentFixture<DetailRessourceUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let detailRessourceFormService: DetailRessourceFormService;
  let detailRessourceService: DetailRessourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [DetailRessourceUpdateComponent],
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
      .overrideTemplate(DetailRessourceUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DetailRessourceUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    detailRessourceFormService = TestBed.inject(DetailRessourceFormService);
    detailRessourceService = TestBed.inject(DetailRessourceService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const detailRessource: IDetailRessource = { id: 456 };

      activatedRoute.data = of({ detailRessource });
      comp.ngOnInit();

      expect(comp.detailRessource).toEqual(detailRessource);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDetailRessource>>();
      const detailRessource = { id: 123 };
      jest.spyOn(detailRessourceFormService, 'getDetailRessource').mockReturnValue(detailRessource);
      jest.spyOn(detailRessourceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ detailRessource });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: detailRessource }));
      saveSubject.complete();

      // THEN
      expect(detailRessourceFormService.getDetailRessource).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(detailRessourceService.update).toHaveBeenCalledWith(expect.objectContaining(detailRessource));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDetailRessource>>();
      const detailRessource = { id: 123 };
      jest.spyOn(detailRessourceFormService, 'getDetailRessource').mockReturnValue({ id: null });
      jest.spyOn(detailRessourceService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ detailRessource: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: detailRessource }));
      saveSubject.complete();

      // THEN
      expect(detailRessourceFormService.getDetailRessource).toHaveBeenCalled();
      expect(detailRessourceService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDetailRessource>>();
      const detailRessource = { id: 123 };
      jest.spyOn(detailRessourceService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ detailRessource });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(detailRessourceService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
