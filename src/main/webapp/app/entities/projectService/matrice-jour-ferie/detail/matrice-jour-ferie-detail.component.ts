import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IMatriceJourFerie } from '../matrice-jour-ferie.model';

@Component({
  selector: 'jhi-matrice-jour-ferie-detail',
  templateUrl: './matrice-jour-ferie-detail.component.html',
})
export class MatriceJourFerieDetailComponent implements OnInit {
  matriceJourFerie: IMatriceJourFerie | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ matriceJourFerie }) => {
      this.matriceJourFerie = matriceJourFerie;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
