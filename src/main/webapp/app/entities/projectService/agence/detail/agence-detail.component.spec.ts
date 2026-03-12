import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AgenceDetailComponent } from './agence-detail.component';

describe('Agence Management Detail Component', () => {
  let comp: AgenceDetailComponent;
  let fixture: ComponentFixture<AgenceDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgenceDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ agence: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(AgenceDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(AgenceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load agence on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.agence).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
