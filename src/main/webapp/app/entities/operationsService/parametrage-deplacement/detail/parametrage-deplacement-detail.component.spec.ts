import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ParametrageDeplacementDetailComponent } from './parametrage-deplacement-detail.component';

describe('ParametrageDeplacement Management Detail Component', () => {
  let comp: ParametrageDeplacementDetailComponent;
  let fixture: ComponentFixture<ParametrageDeplacementDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParametrageDeplacementDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ parametrageDeplacement: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ParametrageDeplacementDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ParametrageDeplacementDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load parametrageDeplacement on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.parametrageDeplacement).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
