import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DetailRessourceDetailComponent } from './detail-ressource-detail.component';

describe('DetailRessource Management Detail Component', () => {
  let comp: DetailRessourceDetailComponent;
  let fixture: ComponentFixture<DetailRessourceDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailRessourceDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ detailRessource: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(DetailRessourceDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(DetailRessourceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load detailRessource on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.detailRessource).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
