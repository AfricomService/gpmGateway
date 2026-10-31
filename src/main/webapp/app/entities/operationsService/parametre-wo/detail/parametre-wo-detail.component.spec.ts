import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ParametreWODetailComponent } from './parametre-wo-detail.component';

describe('ParametreWO Management Detail Component', () => {
  let comp: ParametreWODetailComponent;
  let fixture: ComponentFixture<ParametreWODetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParametreWODetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ parametreWO: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ParametreWODetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ParametreWODetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load parametreWO on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.parametreWO).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
