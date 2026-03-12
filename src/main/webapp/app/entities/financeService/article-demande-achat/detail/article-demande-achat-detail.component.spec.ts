import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ArticleDemandeAchatDetailComponent } from './article-demande-achat-detail.component';

describe('ArticleDemandeAchat Management Detail Component', () => {
  let comp: ArticleDemandeAchatDetailComponent;
  let fixture: ComponentFixture<ArticleDemandeAchatDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArticleDemandeAchatDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ articleDemandeAchat: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ArticleDemandeAchatDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ArticleDemandeAchatDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load articleDemandeAchat on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.articleDemandeAchat).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
