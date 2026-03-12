import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { OtExterneDetailComponent } from './ot-externe-detail.component';

describe('OtExterne Management Detail Component', () => {
  let comp: OtExterneDetailComponent;
  let fixture: ComponentFixture<OtExterneDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OtExterneDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ otExterne: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(OtExterneDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(OtExterneDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load otExterne on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.otExterne).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
