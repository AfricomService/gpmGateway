import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { JourFerieDetailComponent } from './jour-ferie-detail.component';

describe('JourFerie Management Detail Component', () => {
  let comp: JourFerieDetailComponent;
  let fixture: ComponentFixture<JourFerieDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JourFerieDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ jourFerie: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(JourFerieDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(JourFerieDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load jourFerie on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.jourFerie).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
