import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PhaseOtDetailComponent } from './phase-ot-detail.component';

describe('PhaseOt Management Detail Component', () => {
  let comp: PhaseOtDetailComponent;
  let fixture: ComponentFixture<PhaseOtDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PhaseOtDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ phaseOt: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(PhaseOtDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(PhaseOtDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load phaseOt on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.phaseOt).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
