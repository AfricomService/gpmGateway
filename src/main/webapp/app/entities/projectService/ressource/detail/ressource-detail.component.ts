import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IRessource } from '../ressource.model';

@Component({
  selector: 'jhi-ressource-detail',
  templateUrl: './ressource-detail.component.html',
})
export class RessourceDetailComponent implements OnInit {
  ressource: IRessource | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ ressource }) => {
      this.ressource = ressource;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
