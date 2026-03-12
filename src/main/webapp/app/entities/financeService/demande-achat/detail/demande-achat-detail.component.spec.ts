import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DemandeAchatDetailComponent } from './demande-achat-detail.component';

describe('DemandeAchat Management Detail Component', () => {
  let comp: DemandeAchatDetailComponent;
  let fixture: ComponentFixture<DemandeAchatDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DemandeAchatDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ demandeAchat: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(DemandeAchatDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(DemandeAchatDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load demandeAchat on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.demandeAchat).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
