import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDepenseDiverse } from '../depense-diverse.model';

@Component({
  selector: 'jhi-depense-diverse-detail',
  templateUrl: './depense-diverse-detail.component.html',
})
export class DepenseDiverseDetailComponent implements OnInit {
  depenseDiverse: IDepenseDiverse | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ depenseDiverse }) => {
      this.depenseDiverse = depenseDiverse;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
