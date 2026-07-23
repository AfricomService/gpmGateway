import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { NumsequentielleDetailComponent } from './numsequentielle-detail.component';

describe('Numsequentielle Management Detail Component', () => {
  let comp: NumsequentielleDetailComponent;
  let fixture: ComponentFixture<NumsequentielleDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NumsequentielleDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ numsequentielle: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(NumsequentielleDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(NumsequentielleDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load numsequentielle on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.numsequentielle).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
