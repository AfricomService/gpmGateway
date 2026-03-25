import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAffaire } from '../affaire.model';

@Component({
  selector: 'jhi-affaire-detail',
  templateUrl: './affaire-detail.component.html',
  styleUrls: ['./affaire-detail.component.scss'],
})
export class AffaireDetailComponent implements OnInit {
  affaire: IAffaire | null = null;
  articles: any[] = [];
  matrice: any[] = [];
  documents: any[] = [];

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ affaire }) => {
      this.affaire = affaire;
    });

    this.articles = [
      { code: 'ART-001', designation: 'Câble fibre optique', unite: 'm', contractuelle: 50000, realisee: 42000 },
      { code: 'ART-002', designation: 'Connecteur SC/APC', unite: 'pièce', contractuelle: 2000, realisee: 1750 },
    ];

    this.matrice = [
      { ville: 'Tunis', zone: 'Nord', base: 50, nuit: 0 },
      { ville: 'Sfax', zone: 'Centre', base: 55, nuit: 0 },
    ];

    this.documents = [{ name: 'etude_faisabilite.pdf' }, { name: 'cahier_charges.pdf' }, { name: 'bon_commande.pdf' }];
  }

  previousState(): void {
    window.history.back();
  }
}
