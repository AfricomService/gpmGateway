import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { TacheDetailComponent } from './tache-detail.component';

describe('Tache Management Detail Component', () => {
  let comp: TacheDetailComponent;
  let fixture: ComponentFixture<TacheDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TacheDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ tache: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(TacheDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(TacheDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load tache on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.tache).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
