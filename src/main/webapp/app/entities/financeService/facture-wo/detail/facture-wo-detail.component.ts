import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFactureWO } from '../facture-wo.model';

@Component({
  selector: 'jhi-facture-wo-detail',
  templateUrl: './facture-wo-detail.component.html',
})
export class FactureWODetailComponent implements OnInit {
  factureWO: IFactureWO | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ factureWO }) => {
      this.factureWO = factureWO;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
