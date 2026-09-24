import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IArticle } from 'app/entities/projectService/article/article.model'; // adjust path
import { ArticleService } from 'app/entities/projectService/article/service/article.service'; // adjust path

export interface ArticleAffectationResult {
  article: IArticle;
  prixPropose: number;
  qteCommandee: number;
}

@Component({
  selector: 'jhi-article-selector-modal',
  templateUrl: './article-selector-modal.component.html',
})
export class ArticleSelectorModalComponent implements OnInit {
  modalTitle = 'Sélectionner un article';

  articles: IArticle[] = [];
  filteredArticles: IArticle[] = [];
  loading = false;
  searchTerm = '';

  selectedArticle: IArticle | null = null;
  prixPropose: number | null = null;
  qteCommandee: number | null = null;

  submitError = '';

  constructor(public activeModal: NgbActiveModal, protected articleService: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  private loadArticles(): void {
    this.loading = true;
    this.articleService.query({ size: 500 }).subscribe({
      next: res => {
        this.articles = res.body ?? [];
        this.filteredArticles = this.articles;
        this.loading = false;
      },
      error: () => {
        this.articles = [];
        this.filteredArticles = [];
        this.loading = false;
      },
    });
  }

  onSearchInput(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredArticles = !term
      ? this.articles
      : this.articles.filter(a => (a.designation ?? '').toLowerCase().includes(term) || (a.code ?? '').toLowerCase().includes(term));
  }

  selectArticle(article: IArticle): void {
    this.selectedArticle = article;
    if ((this.prixPropose === null || this.prixPropose === undefined) && article.prixUnitHT !== null && article.prixUnitHT !== undefined) {
      this.prixPropose = article.prixUnitHT;
    }
  }

  confirm(): void {
    this.submitError = '';

    if (!this.selectedArticle) {
      this.submitError = 'Veuillez sélectionner un article.';
      return;
    }
    if (this.prixPropose === null || this.prixPropose === undefined || this.prixPropose < 0) {
      this.submitError = 'Veuillez saisir un prix proposé valide.';
      return;
    }
    if (this.qteCommandee === null || this.qteCommandee === undefined || this.qteCommandee <= 0) {
      this.submitError = 'Veuillez saisir une quantité commandée valide.';
      return;
    }

    const result: ArticleAffectationResult = {
      article: this.selectedArticle,
      prixPropose: this.prixPropose,
      qteCommandee: this.qteCommandee,
    };
    this.activeModal.close(result);
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}
