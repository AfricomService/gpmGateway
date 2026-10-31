import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IParametrageDeplacement } from '../parametrage-deplacement.model';

@Component({
  selector: 'jhi-parametrage-deplacement-detail',
  templateUrl: './parametrage-deplacement-detail.component.html',
})
export class ParametrageDeplacementDetailComponent implements OnInit {
  parametrageDeplacement: IParametrageDeplacement | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ parametrageDeplacement }) => {
      this.parametrageDeplacement = parametrageDeplacement;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
