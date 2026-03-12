import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IMatriceFacturation } from '../matrice-facturation.model';

@Component({
  selector: 'jhi-matrice-facturation-detail',
  templateUrl: './matrice-facturation-detail.component.html',
})
export class MatriceFacturationDetailComponent implements OnInit {
  matriceFacturation: IMatriceFacturation | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ matriceFacturation }) => {
      this.matriceFacturation = matriceFacturation;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
