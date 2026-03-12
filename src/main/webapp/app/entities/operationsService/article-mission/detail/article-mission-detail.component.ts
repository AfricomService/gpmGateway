import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IArticleMission } from '../article-mission.model';

@Component({
  selector: 'jhi-article-mission-detail',
  templateUrl: './article-mission-detail.component.html',
})
export class ArticleMissionDetailComponent implements OnInit {
  articleMission: IArticleMission | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ articleMission }) => {
      this.articleMission = articleMission;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
