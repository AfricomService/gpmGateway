import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ModelPhaseOTDetailComponent } from './model-phase-ot-detail.component';

describe('ModelPhaseOT Management Detail Component', () => {
  let comp: ModelPhaseOTDetailComponent;
  let fixture: ComponentFixture<ModelPhaseOTDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModelPhaseOTDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ modelPhaseOT: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ModelPhaseOTDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ModelPhaseOTDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load modelPhaseOT on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.modelPhaseOT).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
