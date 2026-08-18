import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { RessourceDetailComponent } from './ressource-detail.component';

describe('Ressource Management Detail Component', () => {
  let comp: RessourceDetailComponent;
  let fixture: ComponentFixture<RessourceDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RessourceDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ ressource: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(RessourceDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(RessourceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load ressource on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.ressource).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
