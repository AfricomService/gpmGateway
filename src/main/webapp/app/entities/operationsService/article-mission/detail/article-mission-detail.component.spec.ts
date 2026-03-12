import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ArticleMissionDetailComponent } from './article-mission-detail.component';

describe('ArticleMission Management Detail Component', () => {
  let comp: ArticleMissionDetailComponent;
  let fixture: ComponentFixture<ArticleMissionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArticleMissionDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ articleMission: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ArticleMissionDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ArticleMissionDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load articleMission on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.articleMission).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
