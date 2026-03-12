import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAgence } from '../agence.model';

@Component({
  selector: 'jhi-agence-detail',
  templateUrl: './agence-detail.component.html',
})
export class AgenceDetailComponent implements OnInit {
  agence: IAgence | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ agence }) => {
      this.agence = agence;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
