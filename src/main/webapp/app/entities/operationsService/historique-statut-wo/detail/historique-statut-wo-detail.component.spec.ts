import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { HistoriqueStatutWODetailComponent } from './historique-statut-wo-detail.component';

describe('HistoriqueStatutWO Management Detail Component', () => {
  let comp: HistoriqueStatutWODetailComponent;
  let fixture: ComponentFixture<HistoriqueStatutWODetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoriqueStatutWODetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ historiqueStatutWO: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(HistoriqueStatutWODetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(HistoriqueStatutWODetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load historiqueStatutWO on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.historiqueStatutWO).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
