import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAffaireArticle } from '../affaire-article.model';

@Component({
  selector: 'jhi-affaire-article-detail',
  templateUrl: './affaire-article-detail.component.html',
})
export class AffaireArticleDetailComponent implements OnInit {
  affaireArticle: IAffaireArticle | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ affaireArticle }) => {
      this.affaireArticle = affaireArticle;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
