import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ITache } from '../tache.model';

@Component({
  selector: 'jhi-tache-detail',
  templateUrl: './tache-detail.component.html',
})
export class TacheDetailComponent implements OnInit {
  tache: ITache | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tache }) => {
      this.tache = tache;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
