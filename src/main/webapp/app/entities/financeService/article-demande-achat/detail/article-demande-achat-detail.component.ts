import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IArticleDemandeAchat } from '../article-demande-achat.model';

@Component({
  selector: 'jhi-article-demande-achat-detail',
  templateUrl: './article-demande-achat-detail.component.html',
})
export class ArticleDemandeAchatDetailComponent implements OnInit {
  articleDemandeAchat: IArticleDemandeAchat | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ articleDemandeAchat }) => {
      this.articleDemandeAchat = articleDemandeAchat;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
