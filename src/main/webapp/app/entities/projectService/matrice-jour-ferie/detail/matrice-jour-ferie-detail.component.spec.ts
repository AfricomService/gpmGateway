import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MatriceJourFerieDetailComponent } from './matrice-jour-ferie-detail.component';

describe('MatriceJourFerie Management Detail Component', () => {
  let comp: MatriceJourFerieDetailComponent;
  let fixture: ComponentFixture<MatriceJourFerieDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatriceJourFerieDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ matriceJourFerie: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(MatriceJourFerieDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(MatriceJourFerieDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load matriceJourFerie on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.matriceJourFerie).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
