import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { WoMotifDetailComponent } from './wo-motif-detail.component';

describe('WoMotif Management Detail Component', () => {
  let comp: WoMotifDetailComponent;
  let fixture: ComponentFixture<WoMotifDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WoMotifDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ woMotif: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(WoMotifDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(WoMotifDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load woMotif on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.woMotif).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
