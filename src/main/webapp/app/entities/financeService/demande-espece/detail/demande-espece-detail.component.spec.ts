import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DemandeEspeceDetailComponent } from './demande-espece-detail.component';

describe('DemandeEspece Management Detail Component', () => {
  let comp: DemandeEspeceDetailComponent;
  let fixture: ComponentFixture<DemandeEspeceDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DemandeEspeceDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ demandeEspece: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(DemandeEspeceDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(DemandeEspeceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load demandeEspece on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.demandeEspece).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
