import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SSTDetailComponent } from './sst-detail.component';

describe('SST Management Detail Component', () => {
  let comp: SSTDetailComponent;
  let fixture: ComponentFixture<SSTDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SSTDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ sST: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(SSTDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SSTDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load sST on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.sST).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
