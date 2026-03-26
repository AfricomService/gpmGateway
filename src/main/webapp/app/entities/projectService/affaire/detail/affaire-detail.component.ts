import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAffaire } from '../affaire.model';
import { IAffaireArticle } from 'app/entities/projectService/affaire-article/affaire-article.model';
import { AffaireArticleService } from 'app/entities/projectService/affaire-article/service/affaire-article.service';

@Component({
  selector: 'jhi-affaire-detail',
  templateUrl: './affaire-detail.component.html',
  styleUrls: ['./affaire-detail.component.scss'],
})
export class AffaireDetailComponent implements OnInit {
  affaire: IAffaire | null = null;
  articles: IAffaireArticle[] = [];
  matrice: any[] = [];
  documents: any[] = [];

  constructor(protected activatedRoute: ActivatedRoute, protected affaireArticleService: AffaireArticleService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ affaire }) => {
      this.affaire = affaire;
      if (affaire && affaire.id) {
        this.loadArticles(affaire.id);
      }
    });

    this.matrice = [
      { ville: 'Tunis', zone: 'Nord', base: 50, nuit: 0 },
      { ville: 'Sfax', zone: 'Centre', base: 55, nuit: 0 },
    ];

    this.documents = [{ name: 'etude_faisabilite.pdf' }, { name: 'cahier_charges.pdf' }, { name: 'bon_commande.pdf' }];
  }

  loadArticles(affaireId: number): void {
    this.affaireArticleService.findByAffaireId(affaireId).subscribe(res => {
      this.articles = res.body || [];
    });
  }

  previousState(): void {
    window.history.back();
  }
}
