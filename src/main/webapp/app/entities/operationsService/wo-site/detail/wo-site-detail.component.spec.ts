import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { WoSiteDetailComponent } from './wo-site-detail.component';

describe('WoSite Management Detail Component', () => {
  let comp: WoSiteDetailComponent;
  let fixture: ComponentFixture<WoSiteDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WoSiteDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ woSite: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(WoSiteDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(WoSiteDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load woSite on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.woSite).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
