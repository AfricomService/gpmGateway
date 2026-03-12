import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AffaireDetailComponent } from './affaire-detail.component';

describe('Affaire Management Detail Component', () => {
  let comp: AffaireDetailComponent;
  let fixture: ComponentFixture<AffaireDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AffaireDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ affaire: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(AffaireDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(AffaireDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load affaire on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.affaire).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
