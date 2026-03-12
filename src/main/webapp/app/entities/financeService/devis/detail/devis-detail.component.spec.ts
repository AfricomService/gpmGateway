import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DevisDetailComponent } from './devis-detail.component';

describe('Devis Management Detail Component', () => {
  let comp: DevisDetailComponent;
  let fixture: ComponentFixture<DevisDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevisDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ devis: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(DevisDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(DevisDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load devis on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.devis).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
