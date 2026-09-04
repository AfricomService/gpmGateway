import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { IArticle } from 'app/entities/projectService/article/article.model';
import { AffaireService, RestPage } from 'app/entities/projectService/affaire/service/affaire.service';

export interface ArticleSelection {
  article: IArticle;
  qte: number;
  qteEffectuee?: number | null;
}

const PAGE_SIZE = 5;

@Component({
  selector: 'jhi-article-selector-modal',
  templateUrl: './article-selector-modal.component.html',
  styleUrls: ['./article-selector-modal.component.scss'],
})
export class ArticleSelectorModalComponent implements OnInit, OnDestroy {
  /** Projet dont on veut afficher les articles, injecté via `modalRef.componentInstance.affaireId = ...`. */
  @Input() affaireId: number | null = null;

  /** Sélection déjà faite avant l'ouverture (pour pré-cocher + garder les quantités), injectée par l'appelant. */
  @Input() initialSelection: ArticleSelection[] = [];

  articles: IArticle[] = [];
  totalItems = 0;
  page = 1; // 1-indexé pour ngb-pagination
  itemsPerPage = PAGE_SIZE;
  searchTerm = '';
  loading = false;

  /**
   * id -> sélection, conservé indépendamment de la page affichée pour ne pas perdre
   * la sélection faite sur une page précédente en naviguant/recherchant.
   */
  selectedMap: Map<number, ArticleSelection> = new Map<number, ArticleSelection>();

  private readonly searchSubject = new Subject<string>();

  constructor(public activeModal: NgbActiveModal, private affaireService: AffaireService) {}

  ngOnInit(): void {
    this.initialSelection.forEach(sel => {
      if (sel.article.id !== null && sel.article.id !== undefined) {
        this.selectedMap.set(sel.article.id, { article: sel.article, qte: sel.qte, qteEffectuee: sel.qteEffectuee ?? 0 });
      }
    });

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(search => {
      this.searchTerm = search;
      this.page = 1;
      this.loadArticles();
    });

    this.loadArticles();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadArticles();
  }

  loadArticles(): void {
    if (this.affaireId === null || this.affaireId === undefined) {
      this.articles = [];
      this.totalItems = 0;
      return;
    }

    this.loading = true;

    const requestParams = {
      page: this.page - 1, // Spring Data est 0-indexé
      size: this.itemsPerPage,
      searchTerm: this.searchTerm,
    };

    this.affaireService
      .getArticlesByAffaire(this.affaireId, requestParams)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: HttpResponse<RestPage<IArticle>>) => {
          if (res.body) {
            this.articles = res.body.content;
            this.totalItems = res.body.totalElements;
          }
        },
        error: () => {
          this.articles = [];
          this.totalItems = 0;
        },
      });
  }

  isSelected(article: IArticle): boolean {
    return article.id !== null && article.id !== undefined && this.selectedMap.has(article.id);
  }

  toggleSelection(article: IArticle): void {
    if (article.id === null || article.id === undefined) {
      return;
    }

    if (this.selectedMap.has(article.id)) {
      this.selectedMap.delete(article.id);
    } else {
      this.selectedMap.set(article.id, { article, qte: 1, qteEffectuee: 0 });
    }
  }

  getQuantity(articleId: number): number {
    return this.selectedMap.get(articleId)?.qte ?? 1;
  }

  onQuantityChange(articleId: number, qte: number | string): void {
    const parsed = Number(qte);
    const existing = this.selectedMap.get(articleId);
    if (existing) {
      existing.qte = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }
  }

  get selectedCount(): number {
    return this.selectedMap.size;
  }

  confirm(): void {
    this.activeModal.close(Array.from(this.selectedMap.values()));
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
