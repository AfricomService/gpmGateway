import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { INoteFrais } from '../note-frais.model';

@Component({
  selector: 'jhi-note-frais-detail',
  templateUrl: './note-frais-detail.component.html',
})
export class NoteFraisDetailComponent implements OnInit {
  noteFrais: INoteFrais | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ noteFrais }) => {
      this.noteFrais = noteFrais;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
