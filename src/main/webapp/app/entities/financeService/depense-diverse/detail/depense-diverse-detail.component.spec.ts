import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DepenseDiverseDetailComponent } from './depense-diverse-detail.component';

describe('DepenseDiverse Management Detail Component', () => {
  let comp: DepenseDiverseDetailComponent;
  let fixture: ComponentFixture<DepenseDiverseDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DepenseDiverseDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ depenseDiverse: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(DepenseDiverseDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(DepenseDiverseDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load depenseDiverse on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.depenseDiverse).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
