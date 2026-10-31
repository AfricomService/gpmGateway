import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ParametrageDeplacementService } from '../service/parametrage-deplacement.service';

import { ParametrageDeplacementComponent } from './parametrage-deplacement.component';

describe('ParametrageDeplacement Management Component', () => {
  let comp: ParametrageDeplacementComponent;
  let fixture: ComponentFixture<ParametrageDeplacementComponent>;
  let service: ParametrageDeplacementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'parametrage-deplacement', component: ParametrageDeplacementComponent }]),
        HttpClientTestingModule,
      ],
      declarations: [ParametrageDeplacementComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              defaultSort: 'id,asc',
            }),
            queryParamMap: of(
              jest.requireActual('@angular/router').convertToParamMap({
                page: '1',
                size: '1',
                sort: 'id,desc',
              })
            ),
            snapshot: { queryParams: {} },
          },
        },
      ],
    })
      .overrideTemplate(ParametrageDeplacementComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ParametrageDeplacementComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ParametrageDeplacementService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        })
      )
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.parametrageDeplacements?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });

  describe('trackId', () => {
    it('Should forward to parametrageDeplacementService', () => {
      const entity = { id: 123 };
      jest.spyOn(service, 'getParametrageDeplacementIdentifier');
      const id = comp.trackId(0, entity);
      expect(service.getParametrageDeplacementIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });
});
