import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ParametreWOService } from '../service/parametre-wo.service';

import { ParametreWOComponent } from './parametre-wo.component';

describe('ParametreWO Management Component', () => {
  let comp: ParametreWOComponent;
  let fixture: ComponentFixture<ParametreWOComponent>;
  let service: ParametreWOService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'parametre-wo', component: ParametreWOComponent }]), HttpClientTestingModule],
      declarations: [ParametreWOComponent],
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
      .overrideTemplate(ParametreWOComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ParametreWOComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ParametreWOService);

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
    expect(comp.parametreWOS?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });

  describe('trackId', () => {
    it('Should forward to parametreWOService', () => {
      const entity = { id: 123 };
      jest.spyOn(service, 'getParametreWOIdentifier');
      const id = comp.trackId(0, entity);
      expect(service.getParametreWOIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });
});
