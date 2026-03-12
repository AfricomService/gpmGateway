import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FactureWODetailComponent } from './facture-wo-detail.component';

describe('FactureWO Management Detail Component', () => {
  let comp: FactureWODetailComponent;
  let fixture: ComponentFixture<FactureWODetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FactureWODetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ factureWO: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(FactureWODetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(FactureWODetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load factureWO on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.factureWO).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
