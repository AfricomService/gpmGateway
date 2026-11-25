import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { NoteFraisDetailComponent } from './note-frais-detail.component';

describe('NoteFrais Management Detail Component', () => {
  let comp: NoteFraisDetailComponent;
  let fixture: ComponentFixture<NoteFraisDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoteFraisDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ noteFrais: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(NoteFraisDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(NoteFraisDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load noteFrais on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.noteFrais).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
