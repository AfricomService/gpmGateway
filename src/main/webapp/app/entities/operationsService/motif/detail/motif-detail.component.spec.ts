import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MotifDetailComponent } from './motif-detail.component';

describe('Motif Management Detail Component', () => {
  let comp: MotifDetailComponent;
  let fixture: ComponentFixture<MotifDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MotifDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ motif: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(MotifDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(MotifDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load motif on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.motif).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
