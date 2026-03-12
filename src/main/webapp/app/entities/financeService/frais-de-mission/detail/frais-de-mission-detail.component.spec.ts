import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FraisDeMissionDetailComponent } from './frais-de-mission-detail.component';

describe('FraisDeMission Management Detail Component', () => {
  let comp: FraisDeMissionDetailComponent;
  let fixture: ComponentFixture<FraisDeMissionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FraisDeMissionDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ fraisDeMission: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(FraisDeMissionDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(FraisDeMissionDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load fraisDeMission on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.fraisDeMission).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
