import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MatriceFacturationDetailComponent } from './matrice-facturation-detail.component';

describe('MatriceFacturation Management Detail Component', () => {
  let comp: MatriceFacturationDetailComponent;
  let fixture: ComponentFixture<MatriceFacturationDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatriceFacturationDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ matriceFacturation: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(MatriceFacturationDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(MatriceFacturationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load matriceFacturation on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.matriceFacturation).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
