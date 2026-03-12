import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IHistoriqueStatutWO } from '../historique-statut-wo.model';

@Component({
  selector: 'jhi-historique-statut-wo-detail',
  templateUrl: './historique-statut-wo-detail.component.html',
})
export class HistoriqueStatutWODetailComponent implements OnInit {
  historiqueStatutWO: IHistoriqueStatutWO | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ historiqueStatutWO }) => {
      this.historiqueStatutWO = historiqueStatutWO;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
