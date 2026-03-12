import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { WoUtilisateurDetailComponent } from './wo-utilisateur-detail.component';

describe('WoUtilisateur Management Detail Component', () => {
  let comp: WoUtilisateurDetailComponent;
  let fixture: ComponentFixture<WoUtilisateurDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WoUtilisateurDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ woUtilisateur: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(WoUtilisateurDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(WoUtilisateurDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load woUtilisateur on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.woUtilisateur).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
