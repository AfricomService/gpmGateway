import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ArticleDetailComponent } from './article-detail.component';

describe('Article Management Detail Component', () => {
  let comp: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArticleDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ article: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ArticleDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ArticleDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load article on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.article).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
