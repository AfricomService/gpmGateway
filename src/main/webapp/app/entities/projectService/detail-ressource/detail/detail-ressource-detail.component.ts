import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDetailRessource } from '../detail-ressource.model';

@Component({
  selector: 'jhi-detail-ressource-detail',
  templateUrl: './detail-ressource-detail.component.html',
})
export class DetailRessourceDetailComponent implements OnInit {
  detailRessource: IDetailRessource | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ detailRessource }) => {
      this.detailRessource = detailRessource;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
