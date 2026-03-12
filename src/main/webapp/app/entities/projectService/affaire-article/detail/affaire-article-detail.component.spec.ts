import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AffaireArticleDetailComponent } from './affaire-article-detail.component';

describe('AffaireArticle Management Detail Component', () => {
  let comp: AffaireArticleDetailComponent;
  let fixture: ComponentFixture<AffaireArticleDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AffaireArticleDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ affaireArticle: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(AffaireArticleDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(AffaireArticleDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load affaireArticle on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.affaireArticle).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
