import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ActiviteDetailComponent } from './activite-detail.component';

describe('Activite Management Detail Component', () => {
  let comp: ActiviteDetailComponent;
  let fixture: ComponentFixture<ActiviteDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActiviteDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ activite: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ActiviteDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ActiviteDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load activite on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.activite).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
