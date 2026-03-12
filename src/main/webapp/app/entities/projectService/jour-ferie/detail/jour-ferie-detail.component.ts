import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IJourFerie } from '../jour-ferie.model';

@Component({
  selector: 'jhi-jour-ferie-detail',
  templateUrl: './jour-ferie-detail.component.html',
})
export class JourFerieDetailComponent implements OnInit {
  jourFerie: IJourFerie | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ jourFerie }) => {
      this.jourFerie = jourFerie;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
